export interface StudentFormData {
  preferredLanguage: string
  adhaarNumber: string
  firstName: string
  middleName: string
  lastName: string
  password: string
  dateOfBirth: string
  gender: string
  schoolNameAndAddress: string
  schoolEnrollmentNumber: string
  class: string
  board: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  country: string
  pincode: string
  email: string
  mobile: string
}

export const initialFormData: StudentFormData = {
  preferredLanguage: '',
  adhaarNumber: '',
  firstName: '',
  middleName: '',
  lastName: '',
  password: '',
  dateOfBirth: '',
  gender: '',
  schoolNameAndAddress: '',
  schoolEnrollmentNumber: '',
  class: '',
  board: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  email: '',
  mobile: '',
}

export const LANGUAGES = ['English', 'Hindi', 'Marathi'] as const
export const GENDERS = ['Male', 'Female', 'Other'] as const
export const CLASS_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const
export const BOARDS = ['CBSE', 'ICSE', 'State Board'] as const
export const CITIES = [
  'Mumbai',
  'Delhi',
  'Pune',
  'Bangalore',
  'Hyderabad',
  'Ahmedabad',
  'Chennai',
  'Kolkata',
  'Jaipur',
  'Lucknow',
  'Bhopal',
  'Indore',
  'Nagpur',
  'Chandigarh',
  'Surat',
  'Patna',
  'Vadodara',
  'Kanpur',
  'Varanasi',
  'Thane',
  'Nashik',
  'Ludhiana',
  'Agra',
  'Coimbatore',
  'Faridabad',
  'Meerut',
  'Rajkot',
  'Amritsar',
  'Noida',
  'Gurgaon',
  'Visakhapatnam',
  // More major Indian cities
  'Allahabad',
  'Ghaziabad',
  'Vadodara',
  'Aurangabad',
  'Solapur',
  'Ranchi',
  'Jodhpur',
  'Madurai',
  'Jabalpur',
  'Gwalior',
  'Vijayawada',
  'Howrah',
  'Mysore',
  'Hubli',
  'Bareilly',
  'Aligarh',
  'Moradabad',
  'Jamshedpur',
  'Asansol',
  'Dhanbad',
  'Gaya',
  'Udaipur',
  'Tiruchirappalli',
  'Tiruppur',
  'Guntur',
  'Guwahati',
  'Kochi',
  'Dehradun',
  'Jhansi',
  'Jalandhar',
  'Bhilai',
  'Warangal',
  'Cuttack',
  'Firozabad',
  'Kota',
  'Bhilwara',
  'Shimla',
  'Siliguri',
  'Durgapur',
  'Bokaro',
  'Panaji',
  'Aizawl',
  'Itanagar',
] as const
export const STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
] as const
export const COUNTRIES = ['India'] as const

export interface StudentRecord extends StudentFormData {
  id: string
  createdAt: string
}
