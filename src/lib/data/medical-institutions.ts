// Medical institutions data - moved to separate file for better performance
export const MEDICAL_INSTITUTIONS = {
  'United States': [
    'Harvard Medical School',
    'Johns Hopkins University School of Medicine',
    'Stanford University School of Medicine',
    'University of California, San Francisco School of Medicine',
    'Mayo Clinic Alix School of Medicine',
    'University of Pennsylvania Perelman School of Medicine',
    'Washington University School of Medicine',
    'Yale School of Medicine',
    'Columbia University Vagelos College of Physicians and Surgeons',
    'Duke University School of Medicine',
    'Northwestern University Feinberg School of Medicine',
    'University of Chicago Pritzker School of Medicine',
    'University of Michigan Medical School',
    'University of California, Los Angeles David Geffen School of Medicine',
    'New York University Grossman School of Medicine',
    'Mount Sinai Icahn School of Medicine',
    'Cornell University Weill Cornell Medicine',
    'University of Washington School of Medicine',
    'Vanderbilt University School of Medicine',
    'Emory University School of Medicine'
  ],
  'United Kingdom': [
    'University of Oxford Medical School',
    'University of Cambridge School of Clinical Medicine',
    'Imperial College London Faculty of Medicine',
    'University College London Medical School',
    'King\'s College London School of Medicine',
    'University of Edinburgh Medical School',
    'University of Manchester Medical School',
    'University of Birmingham Medical School',
    'University of Bristol Medical School',
    'University of Glasgow School of Medicine'
  ],
  'Canada': [
    'University of Toronto Faculty of Medicine',
    'McGill University Faculty of Medicine',
    'University of British Columbia Faculty of Medicine',
    'University of Alberta Faculty of Medicine',
    'McMaster University Michael G. DeGroote School of Medicine',
    'University of Calgary Cumming School of Medicine',
    'University of Ottawa Faculty of Medicine',
    'Dalhousie University Faculty of Medicine',
    'University of Western Ontario Schulich School of Medicine',
    'Queen\'s University School of Medicine'
  ],
  'Australia': [
    'University of Melbourne Medical School',
    'University of Sydney Medical School',
    'Monash University Faculty of Medicine',
    'University of Queensland School of Medicine',
    'University of New South Wales Faculty of Medicine',
    'University of Western Australia Medical School',
    'University of Adelaide Medical School',
    'Griffith University School of Medicine',
    'Deakin University School of Medicine',
    'University of Newcastle School of Medicine'
  ],
  'Germany': [
    'Charité - Universitätsmedizin Berlin',
    'Ludwig Maximilian University of Munich Medical School',
    'Heidelberg University Medical School',
    'University of Tübingen Medical School',
    'University of Freiburg Medical School',
    'University of Göttingen Medical School',
    'University of Würzburg Medical School',
    'University of Cologne Medical School',
    'University of Hamburg Medical School',
    'University of Frankfurt Medical School'
  ],
  'France': [
    'Sorbonne University Faculty of Medicine',
    'University of Paris Faculty of Medicine',
    'University of Lyon Faculty of Medicine',
    'University of Marseille Faculty of Medicine',
    'University of Toulouse Faculty of Medicine',
    'University of Strasbourg Faculty of Medicine',
    'University of Lille Faculty of Medicine',
    'University of Bordeaux Faculty of Medicine',
    'University of Montpellier Faculty of Medicine',
    'University of Nantes Faculty of Medicine'
  ],
  'Saudi Arabia': [
    'King Saud University College of Medicine',
    'King Abdulaziz University Faculty of Medicine',
    'King Faisal University College of Medicine',
    'King Khalid University College of Medicine',
    'Imam Abdulrahman Bin Faisal University College of Medicine',
    'Umm Al-Qura University Faculty of Medicine',
    'Taibah University College of Medicine',
    'Qassim University College of Medicine',
    'Tabuk University College of Medicine',
    'Jazan University College of Medicine'
  ],
  'United Arab Emirates': [
    'United Arab Emirates University College of Medicine',
    'Dubai Medical College',
    'Gulf Medical University',
    'Ajman University College of Medicine',
    'University of Sharjah College of Medicine',
    'Ras Al Khaimah Medical and Health Sciences University',
    'Abu Dhabi University College of Medicine',
    'Mohammed Bin Rashid University of Medicine',
    'American University of Sharjah College of Medicine',
    'Zayed University College of Medicine'
  ]
}

export const COUNTRIES = Object.keys(MEDICAL_INSTITUTIONS)

export interface InstitutionData {
  id: string
  name: string
  country: string
  type: 'medical_school' | 'hospital' | 'clinic' | 'research_institute'
  graduationYear?: number
  degree?: string
}







