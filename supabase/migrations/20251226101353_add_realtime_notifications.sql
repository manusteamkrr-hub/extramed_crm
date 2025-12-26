-- Location: supabase/migrations/20251226101353_add_realtime_notifications.sql
-- Schema Analysis: Existing tables - patients, inpatients with status tracking
-- Integration Type: Addition - Adding real-time notification system
-- Dependencies: patients, inpatients tables

-- 1. Create notification types enum
CREATE TYPE public.notification_type AS ENUM ('admission', 'discharge', 'status_change', 'urgent', 'warning', 'info', 'success');

-- 2. Create notification priority enum
CREATE TYPE public.notification_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- 3. Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type public.notification_type NOT NULL,
    priority public.notification_priority DEFAULT 'medium'::public.notification_priority,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    inpatient_id UUID REFERENCES public.inpatients(id) ON DELETE SET NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create indexes for notifications
CREATE INDEX idx_notifications_patient_id ON public.notifications(patient_id);
CREATE INDEX idx_notifications_inpatient_id ON public.notifications(inpatient_id);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- 5. Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policy for notifications (public access for staff notifications)
CREATE POLICY "staff_can_view_all_notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "staff_can_mark_notifications_read"
ON public.notifications
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Create function to automatically create notifications on patient admission
CREATE OR REPLACE FUNCTION public.notify_patient_admission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    INSERT INTO public.notifications (
        type,
        priority,
        title,
        message,
        patient_id,
        inpatient_id
    )
    VALUES (
        'admission'::public.notification_type,
        'medium'::public.notification_priority,
        'Новое поступление',
        'Пациент ' || (SELECT name FROM public.patients WHERE id = NEW.patient_id) || 
        ' поступил в отделение. Палата: ' || COALESCE(NEW.room_number, 'не назначена'),
        NEW.patient_id,
        NEW.id
    );
    RETURN NEW;
END;
$func$;

-- 8. Create function to automatically create notifications on patient discharge
CREATE OR REPLACE FUNCTION public.notify_patient_discharge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    IF NEW.actual_discharge IS NOT NULL AND OLD.actual_discharge IS NULL THEN
        INSERT INTO public.notifications (
            type,
            priority,
            title,
            message,
            patient_id,
            inpatient_id
        )
        VALUES (
            'discharge'::public.notification_type,
            'medium'::public.notification_priority,
            'Выписка пациента',
            'Пациент ' || (SELECT name FROM public.patients WHERE id = NEW.patient_id) || 
            ' выписан из палаты ' || COALESCE(NEW.room_number, 'N/A'),
            NEW.patient_id,
            NEW.id
        );
    END IF;
    RETURN NEW;
END;
$func$;

-- 9. Create function to automatically create notifications on critical status change
CREATE OR REPLACE FUNCTION public.notify_critical_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    IF NEW.has_alerts = true AND (OLD.has_alerts IS NULL OR OLD.has_alerts = false) THEN
        INSERT INTO public.notifications (
            type,
            priority,
            title,
            message,
            patient_id
        )
        VALUES (
            'urgent'::public.notification_type,
            'high'::public.notification_priority,
            'Критическое состояние пациента',
            'У пациента ' || NEW.name || ' зафиксированы критические показатели. Требуется немедленное внимание.',
            NEW.id
        );
    END IF;
    RETURN NEW;
END;
$func$;

-- 10. Create function to check overdue discharges
CREATE OR REPLACE FUNCTION public.notify_overdue_discharge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    days_overdue INTEGER;
BEGIN
    IF NEW.estimated_discharge IS NOT NULL AND 
       NEW.actual_discharge IS NULL AND 
       NEW.estimated_discharge < CURRENT_TIMESTAMP THEN
        
        days_overdue := EXTRACT(DAY FROM (CURRENT_TIMESTAMP - NEW.estimated_discharge));
        
        INSERT INTO public.notifications (
            type,
            priority,
            title,
            message,
            patient_id,
            inpatient_id
        )
        VALUES (
            'warning'::public.notification_type,
            'high'::public.notification_priority,
            'Просроченная выписка',
            'Пациент ' || (SELECT name FROM public.patients WHERE id = NEW.patient_id) || 
            ' (Палата ' || COALESCE(NEW.room_number, 'N/A') || ') - срок выписки истек ' || 
            days_overdue || ' дн. назад',
            NEW.patient_id,
            NEW.id
        );
    END IF;
    RETURN NEW;
END;
$func$;

-- 11. Create triggers for notifications
CREATE TRIGGER on_patient_admission
    AFTER INSERT ON public.inpatients
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_patient_admission();

CREATE TRIGGER on_patient_discharge
    AFTER UPDATE ON public.inpatients
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_patient_discharge();

CREATE TRIGGER on_critical_status_change
    AFTER UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_critical_status_change();

CREATE TRIGGER on_overdue_discharge_check
    AFTER UPDATE ON public.inpatients
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_overdue_discharge();

-- 12. Create sample notifications for existing data
DO $$
DECLARE
    sample_patient_id UUID;
    sample_inpatient_id UUID;
BEGIN
    -- Get a sample patient
    SELECT id INTO sample_patient_id FROM public.patients LIMIT 1;
    
    -- Get a sample inpatient
    SELECT id INTO sample_inpatient_id FROM public.inpatients LIMIT 1;
    
    IF sample_patient_id IS NOT NULL THEN
        -- Create sample notifications
        INSERT INTO public.notifications (type, priority, title, message, patient_id, read)
        VALUES
            ('admission'::public.notification_type, 'medium'::public.notification_priority,
             'Новое поступление', 
             'Пациент поступил в приемное отделение',
             sample_patient_id, true),
            ('success'::public.notification_type, 'low'::public.notification_priority,
             'Оплата получена',
             'Счет оплачен полностью',
             sample_patient_id, true);
    END IF;
END $$;