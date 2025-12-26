// Comprehensive medical services catalog
export const serviceCategories = {
  WARD_TREATMENT: 'ward_treatment',
  CONSULTATIONS: 'consultations',
  INFUSIONS_INPATIENT: 'infusions_inpatient',
  PSYCHOTHERAPY: 'psychotherapy',
  LAB_DIAGNOSTICS: 'lab_diagnostics',
  ADDITIONAL_PROCEDURES: 'additional_procedures'
};

export const medicalServices = [
  // 1. Лечение в палатах (коды 01–24)
  {
    id: '01',
    code: '01',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Лечение в палате "Эконом плюс"',
    price: 10000.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '02',
    code: '02',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Продление лечения в палате "Эконом плюс"',
    price: 10000.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '03',
    code: '03',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Лечение в палате "Стандарт"',
    price: 12000.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '04',
    code: '04',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Продление лечения в палате "Стандарт"',
    price: 12000.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '05',
    code: '05',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Лечение в палате "Эконом"',
    price: 7000.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '06',
    code: '06',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Продление лечения в палате "Эконом"',
    price: 7000.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '07',
    code: '07',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Лечение в палате "ВИП"',
    price: 26000.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '08',
    code: '08',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Продление лечения в палате "ВИП"',
    price: 26000.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '09',
    code: '09',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Лечение в палате "Комфорт"',
    price: 15000.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '10',
    code: '10',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Продление лечения в палате "Комфорт"',
    price: 15000.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '11',
    code: '11',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Лечение в палате "Комфорт+"',
    price: 16000.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '12',
    code: '12',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Продление лечения в палате "Комфорт+"',
    price: 16000.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '13',
    code: '13',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Лечение в палате "Эконом" в сопровождении родственника',
    price: 9000.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '14',
    code: '14',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Продление лечения в палате "Эконом" в сопровождении родственника',
    price: 9000.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '15',
    code: '15',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Лечение в палате "Эконом плюс" в сопровождении родственника',
    price: 13500.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '16',
    code: '16',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Продление лечения в палате "Эконом плюс" в сопровождении родственника',
    price: 13500.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '17',
    code: '17',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Лечение в палате "Стандарт" в сопровождении родственника',
    price: 16500.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '18',
    code: '18',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Продление лечения в палате "Стандарт" в сопровождении родственника',
    price: 16500.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '19',
    code: '19',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Лечение в палате "ВИП" в сопровождении родственника',
    price: 39000.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '20',
    code: '20',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Продление лечения в палате "ВИП" в сопровождении родственника',
    price: 39000.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '21',
    code: '21',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Лечение в палате "Комфорт" в сопровождении родственника',
    price: 22500.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '22',
    code: '22',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Продление лечения в палате "Комфорт" в сопровождении родственника',
    price: 22500.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '23',
    code: '23',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Лечение в палате "Комфорт+" в сопровождении родственника',
    price: 24000.00,
    unit: 'сутки',
    isDailyRate: true
  },
  {
    id: '24',
    code: '24',
    category: serviceCategories?.WARD_TREATMENT,
    name: 'Продление лечения в палате "Комфорт+" в сопровождении родственника',
    price: 24000.00,
    unit: 'сутки',
    isDailyRate: true
  },

  // 2. Консультации (коды 02–13)
  {
    id: 'CONS02',
    code: '02',
    category: serviceCategories?.CONSULTATIONS,
    name: 'Консультация психиатра (первичный осмотр)',
    price: 3500.00,
    unit: 'сеанс',
    isDailyRate: false
  },
  {
    id: 'CONS03',
    code: '03',
    category: serviceCategories?.CONSULTATIONS,
    name: 'Консультация психиатра с назначением препаратов и выпиской рецептов',
    price: 6000.00,
    unit: 'сеанс',
    isDailyRate: false
  },
  {
    id: 'CONS04',
    code: '04',
    category: serviceCategories?.CONSULTATIONS,
    name: 'Консультация Главного врача',
    price: 5000.00,
    unit: 'сеанс',
    isDailyRate: false
  },
  {
    id: 'CONS05',
    code: '05',
    category: serviceCategories?.CONSULTATIONS,
    name: 'Консультация невролога',
    price: 5000.00,
    unit: 'сеанс',
    isDailyRate: false
  },
  {
    id: 'CONS07',
    code: '07',
    category: serviceCategories?.CONSULTATIONS,
    name: 'Консультация по химической зависимости',
    price: 6000.00,
    unit: 'сеанс',
    isDailyRate: false
  },
  {
    id: 'CONS10',
    code: '10',
    category: serviceCategories?.CONSULTATIONS,
    name: 'Консилиум (профессор, д.м.н., к.м.н., главный врач, врач-психиатр, клиник)',
    price: 15000.00,
    unit: 'сеанс',
    isDailyRate: false
  },
  {
    id: 'CONS12',
    code: '12',
    category: serviceCategories?.CONSULTATIONS,
    name: 'Консультация терапевта',
    price: 5000.00,
    unit: 'сеанс',
    isDailyRate: false
  },
  {
    id: 'CONS13',
    code: '13',
    category: serviceCategories?.CONSULTATIONS,
    name: 'Сопровождение консультанта-аддиктолога',
    price: 6000.00,
    unit: 'сеанс',
    isDailyRate: false
  },

  // 3. Капельницы и стационар (коды 01–04)
  {
    id: 'INF01',
    code: '01',
    category: serviceCategories?.INFUSIONS_INPATIENT,
    name: 'Капельница «Стандарт» с 8.00 до 22.00',
    price: 6400.00,
    unit: 'проц.',
    isDailyRate: false
  },
  {
    id: 'INF02',
    code: '02',
    category: serviceCategories?.INFUSIONS_INPATIENT,
    name: 'Капельница «Стандарт» с 22.00 до 8.00',
    price: 7400.00,
    unit: 'проц.',
    isDailyRate: false
  },
  {
    id: 'INF03',
    code: '03',
    category: serviceCategories?.INFUSIONS_INPATIENT,
    name: 'Экстренное вытрезвление (до 3-х капельниц)',
    price: 11500.00,
    unit: 'проц.',
    isDailyRate: false
  },
  {
    id: 'INF04',
    code: '04',
    category: serviceCategories?.INFUSIONS_INPATIENT,
    name: 'Дневной стационар',
    price: 6000.00,
    unit: 'сутки',
    isDailyRate: true
  },

  // 4. Психотерапия (коды 01–11)
  {
    id: 'PSY01',
    code: '01',
    category: serviceCategories?.PSYCHOTHERAPY,
    name: 'Первичная консультация врача-психотерапевта (20 мин)',
    price: 2500.00,
    unit: 'сеанс',
    isDailyRate: false
  },
  {
    id: 'PSY02',
    code: '02',
    category: serviceCategories?.PSYCHOTHERAPY,
    name: 'Индивидуальная психотерапия (1 сеанс)',
    price: 5000.00,
    unit: 'сеанс',
    isDailyRate: false
  },
  {
    id: 'PSY03',
    code: '03',
    category: serviceCategories?.PSYCHOTHERAPY,
    name: 'Индивидуальная психотерапия (комплекс из 3-х сеансов)',
    price: 14000.00,
    unit: 'комп.',
    isDailyRate: false
  },
  {
    id: 'PSY04',
    code: '04',
    category: serviceCategories?.PSYCHOTHERAPY,
    name: 'Индивидуальная психотерапия (комплекс из 5-ти сеансов)',
    price: 23000.00,
    unit: 'комп.',
    isDailyRate: false
  },
  {
    id: 'PSY05',
    code: '05',
    category: serviceCategories?.PSYCHOTHERAPY,
    name: 'Клинико-психологическое консультирование (1 сеанс)',
    price: 8000.00,
    unit: 'сеанс',
    isDailyRate: false
  },
  {
    id: 'PSY06',
    code: '06',
    category: serviceCategories?.PSYCHOTHERAPY,
    name: 'Клинико-психологическое консультирование (3 сеанса)',
    price: 23100.00,
    unit: 'комп.',
    isDailyRate: false
  },
  {
    id: 'PSY07',
    code: '07',
    category: serviceCategories?.PSYCHOTHERAPY,
    name: 'Клинико-психологическое консультирование (5 сеансов)',
    price: 37500.00,
    unit: 'комп.',
    isDailyRate: false
  },
  {
    id: 'PSY08',
    code: '08',
    category: serviceCategories?.PSYCHOTHERAPY,
    name: 'Групповая психотерапия',
    price: 3500.00,
    unit: 'сеанс',
    isDailyRate: false
  },
  {
    id: 'PSY09',
    code: '09',
    category: serviceCategories?.PSYCHOTHERAPY,
    name: 'Групповая психотерапия (комплекс из 3-х сеансов)',
    price: 11000.00,
    unit: 'комп.',
    isDailyRate: false
  },
  {
    id: 'PSY10',
    code: '10',
    category: serviceCategories?.PSYCHOTHERAPY,
    name: 'Групповая психотерапия (комплекс из 5-ти сеансов)',
    price: 15000.00,
    unit: 'комп.',
    isDailyRate: false
  },
  {
    id: 'PSY11',
    code: '11',
    category: serviceCategories?.PSYCHOTHERAPY,
    name: 'Патопсихологическое обследование первичное',
    price: 6500.00,
    unit: 'сеанс',
    isDailyRate: false
  },

  // 5. Лабораторная диагностика (коды 01–07)
  {
    id: 'LAB01',
    code: '01',
    category: serviceCategories?.LAB_DIAGNOSTICS,
    name: 'Экспресс-тест на алкоголь',
    price: 400.00,
    unit: 'шт.',
    isDailyRate: false
  },
  {
    id: 'LAB02',
    code: '02',
    category: serviceCategories?.LAB_DIAGNOSTICS,
    name: 'Тестирование на наркотические вещества (6 групп наркотических средств)',
    price: 1200.00,
    unit: 'тест',
    isDailyRate: false
  },
  {
    id: 'LAB03',
    code: '03',
    category: serviceCategories?.LAB_DIAGNOSTICS,
    name: 'Тестирование на наркотические вещества (10 групп наркотических средств)',
    price: 1800.00,
    unit: 'тест',
    isDailyRate: false
  },
  {
    id: 'LAB04',
    code: '04',
    category: serviceCategories?.LAB_DIAGNOSTICS,
    name: 'Химико-токсикологические исследования мочи на наличие наркотических средств',
    price: 5500.00,
    unit: 'сеанс',
    isDailyRate: false
  },
  {
    id: 'LAB05',
    code: '05',
    category: serviceCategories?.LAB_DIAGNOSTICS,
    name: 'Химико-токсикологические исследования образца биожидкости на наличии',
    price: 2500.00,
    unit: 'сеанс',
    isDailyRate: false
  },
  {
    id: 'LAB06',
    code: '06',
    category: serviceCategories?.LAB_DIAGNOSTICS,
    name: 'Иммунохроматографический анализ мочи на 10 групп наркотических средств',
    price: 1600.00,
    unit: 'сеанс',
    isDailyRate: false
  },
  {
    id: 'LAB07',
    code: '07',
    category: serviceCategories?.LAB_DIAGNOSTICS,
    name: 'Определение маркера злоупотребления алкоголем (CDT)',
    price: 2500.00,
    unit: 'сутки',
    isDailyRate: false
  },

  // 6. Дополнительные процедуры (коды 01–10)
  {
    id: 'ADD01',
    code: '01',
    category: serviceCategories?.ADDITIONAL_PROCEDURES,
    name: 'МРТ гипофиз с контрастом (до 80 кг.)',
    price: 8200.00,
    unit: 'шт.',
    isDailyRate: false
  },
  {
    id: 'ADD02',
    code: '02',
    category: serviceCategories?.ADDITIONAL_PROCEDURES,
    name: 'Ноотропная терапия',
    price: 3000.00,
    unit: 'сеанс',
    isDailyRate: false
  },
  {
    id: 'ADD03',
    code: '03',
    category: serviceCategories?.ADDITIONAL_PROCEDURES,
    name: 'Гепатотропная терапия',
    price: 3500.00,
    unit: 'сеанс',
    isDailyRate: false
  },
  {
    id: 'ADD04',
    code: '04',
    category: serviceCategories?.ADDITIONAL_PROCEDURES,
    name: 'Гипербарическая оксигенотерапия (1 сеанс)',
    price: 6000.00,
    unit: 'сеанс',
    isDailyRate: false
  },
  {
    id: 'ADD05',
    code: '05',
    category: serviceCategories?.ADDITIONAL_PROCEDURES,
    name: 'Гипербарическая оксигенотерапия (комплекс из 3х сеансов)',
    price: 16000.00,
    unit: 'сеанс',
    isDailyRate: false
  },
  {
    id: 'ADD06',
    code: '06',
    category: serviceCategories?.ADDITIONAL_PROCEDURES,
    name: 'Ксенонотерапия (комплекс из 3х сеансов)',
    price: 42000.00,
    unit: 'комп.',
    isDailyRate: false
  },
  {
    id: 'ADD07',
    code: '07',
    category: serviceCategories?.ADDITIONAL_PROCEDURES,
    name: 'Дополнительно 1 литр Xenon к основному сеансу (не более 10 литров на 1 процедура)',
    price: 4500.00,
    unit: 'литр',
    isDailyRate: false
  },
  {
    id: 'ADD08',
    code: '08',
    category: serviceCategories?.ADDITIONAL_PROCEDURES,
    name: 'Процедура детоксикации',
    price: 15000.00,
    unit: 'сеанс',
    isDailyRate: false
  },
  {
    id: 'ADD09',
    code: '09',
    category: serviceCategories?.ADDITIONAL_PROCEDURES,
    name: 'Процедура детоксикации',
    price: 44000.00,
    unit: 'комп.',
    isDailyRate: false
  },
  {
    id: 'ADD10',
    code: '10',
    category: serviceCategories?.ADDITIONAL_PROCEDURES,
    name: 'Процедура детоксикации',
    price: 68000.00,
    unit: 'сеанс',
    isDailyRate: false
  }
];

// Helper function to get services by category
export const getServicesByCategory = (category) => {
  return medicalServices?.filter(service => service?.category === category);
};

// Helper function to get category display name
export const getCategoryDisplayName = (category) => {
  const categoryNames = {
    [serviceCategories?.WARD_TREATMENT]: 'Лечение в палатах',
    [serviceCategories?.CONSULTATIONS]: 'Консультации',
    [serviceCategories?.INFUSIONS_INPATIENT]: 'Капельницы и стационар',
    [serviceCategories?.PSYCHOTHERAPY]: 'Психотерапия',
    [serviceCategories?.LAB_DIAGNOSTICS]: 'Лабораторная диагностика',
    [serviceCategories?.ADDITIONAL_PROCEDURES]: 'Дополнительные процедуры'
  };
  return categoryNames?.[category] || category;
};

// Helper function to calculate service total based on days
export const calculateServiceTotal = (service, days = 1, quantity = 1) => {
  if (!service) return 0;
  const basePrice = service?.price || 0;
  
  if (service?.isDailyRate) {
    return basePrice * days * quantity;
  }
  
  return basePrice * quantity;
};

export default medicalServices;