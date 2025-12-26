# Extramed CRM - Medical Records Management System

A comprehensive medical records and patient management system built with React and Vite.

## 🔄 Database Storage

**This application now uses local SQL file storage instead of Supabase.**

### Local Database Features

- ✅ **Browser-based storage** using localStorage
- ✅ **SQL-like operations** (SELECT, INSERT, UPDATE, DELETE)
- ✅ **Complete schema support** for all medical data
- ✅ **Export/Import** functionality in SQL format
- ✅ **No external dependencies** - works completely offline
- ✅ **Sample data included** - ready to use immediately

### Database Schema

The application maintains the same database schema as defined in `DATABASE_SCHEMA.sql`:

- **patients** - Patient demographics and information
- **diagnoses** - Medical diagnoses
- **medications** - Medication records
- **allergies** - Patient allergies
- **lab_results** - Laboratory test results
- **procedures** - Medical procedures
- **estimates** - Financial estimates and billing
- **estimate_items** - Line items for estimates
- **payments** - Payment transactions
- **rooms** - Hospital room management
- **inpatients** - Inpatient admission records

### Data Management

**Exporting Data:**
```javascript
import localDB from './src/lib/localDatabase';

// Export entire database to SQL format
const sqlExport = localDB.exportToSQL();
console.log(sqlExport);

// Download as file
const blob = new Blob([sqlExport], { type: 'text/plain' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'extramed_backup.sql';
a.click();
```

**Importing Data:**
```javascript
import localDB from './src/lib/localDatabase';

// Import data from JSON structure
const importData = {
  patients: [...],
  estimates: [...],
  // ... other tables
};

localDB.importFromData(importData);
```

**Clearing Data:**
```javascript
import localDB from './src/lib/localDatabase';

// Clear all data and reinitialize with defaults
localDB.clearAll();
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd extramed-crm
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm start
```

The application will start on `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## 📁 Project Structure

```
extramed-crm/
├── src/
│   ├── lib/
│   │   └── localDatabase.js      # Local SQL database manager
│   ├── services/                 # Business logic services
│   │   ├── patientService.js
│   │   ├── estimateService.js
│   │   ├── inpatientService.js
│   │   ├── medicalHistoryService.js
│   │   ├── notificationService.js
│   │   └── reportsService.js
│   ├── pages/                    # Application pages
│   ├── components/               # Reusable components
│   └── utils/                    # Utility functions
├── DATABASE_SCHEMA.sql           # Reference schema
└── package.json
```

## 🔧 Technology Stack

- **Frontend:** React 18.2.0
- **Build Tool:** Vite 5.0.0
- **Routing:** React Router DOM 6.0.2
- **State Management:** Redux Toolkit 2.6.1
- **Styling:** Tailwind CSS 3.4.6
- **Storage:** Browser localStorage (SQL-like operations)
- **Date Utilities:** date-fns 4.1.0
- **Charts:** Recharts 2.15.2

## 📊 Features

### Patient Management
- Complete patient registration and demographics
- Medical record number generation
- Photo uploads and management
- Emergency contact information
- Insurance details tracking

### Medical Records
- Diagnosis tracking (ICD-10 codes)
- Medication management
- Allergy records
- Laboratory results
- Medical procedures history

### Financial Management
- Estimate creation and management
- Payment tracking
- Revenue analytics
- Billing status monitoring

### Inpatient Management
- Room allocation and management
- Admission and discharge tracking
- Occupancy monitoring
- Treatment status updates

### Reports & Analytics
- Patient statistics
- Financial reports
- Occupancy reports
- CSV export functionality

### Real-time Notifications
- Critical patient alerts
- Pending discharge warnings
- Payment reminders
- Room capacity warnings

## 💾 Data Persistence

All data is stored in browser localStorage under the key `extramed_crm_db`. The data persists across browser sessions but is specific to each browser/device.

**Storage Location:** 
- Chrome: DevTools → Application → Local Storage
- Firefox: DevTools → Storage → Local Storage

**Storage Limits:**
- Typical limit: 5-10 MB per domain
- Sufficient for ~1000 patient records with complete medical history

## 🔐 Security Notes

- Data is stored locally in the browser
- No external database connections required
- Data is not encrypted in localStorage (consider this for sensitive data)
- Clearing browser data will delete all records
- Export functionality should be used regularly for backups

## 🛠️ Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Preview production build

### Code Style

- ES6+ JavaScript
- Functional React components with Hooks
- Service layer pattern for business logic
- Tailwind CSS for styling

## 📝 Migration from Supabase

This application previously used Supabase but has been migrated to local storage. The benefits include:

- ✅ No external dependencies or API keys required
- ✅ Works completely offline
- ✅ Faster operations (no network latency)
- ✅ No database setup required
- ✅ Immediate deployment without configuration

If you need to migrate back to Supabase:
1. Install `@supabase/supabase-js`
2. Restore `src/lib/supabase.js`
3. Update all service files to use Supabase client
4. Add Supabase credentials to `.env`

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Add your license information here]

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: [Add contact information]

---

Built with ❤️ using React and Vite