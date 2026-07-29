export interface NigerianWithdrawal {
  id: string;
  name: string;
  city: string;
  state: string;
  bank: string;
  amount: number;
  timeAgo: string;
  timestamp: Date;
  verified: boolean;
}

const FIRST_NAMES_YORUBA = [
  'Adebayo', 'Folake', 'Olumide', 'Femi', 'Babajide', 'Yetunde', 'Tunde', 'Kemi', 'Seun', 'Biodun', 
  'Dayo', 'Bisi', 'Gboyega', 'Gbenga', 'Ronke', 'Yemi', 'Damilola', 'Ayodeji', 'Simisola', 'Olayinka',
  'Tolu', 'Bukola', 'Sola', 'Adewale', 'Funke', 'Kayode', 'Omotola', 'Jide', 'Tayo', 'Kehinde'
];

const FIRST_NAMES_IGBO = [
  'Chinedu', 'Emeka', 'Nneka', 'Nnamdi', 'Chidimma', 'Ifeanyi', 'Uchenna', 'Obinna', 'Chiamaka', 'Tochukwu',
  'Kelechi', 'Somto', 'Ebere', 'Chima', 'Chioma', 'Nonso', 'Ogechi', 'Chika', 'Ndukwe', 'Amarachi',
  'Chibuike', 'Ifeoma', 'Chijioke', 'Uzoma', 'Chikaodili', 'Ekene', 'Chizoba', 'Onyinye', 'Pascal', 'Chimezie'
];

const FIRST_NAMES_HAUSA = [
  'Amina', 'Abubakar', 'Fatima', 'Usman', 'Zainab', 'Ibrahim', 'Halima', 'Sani', 'Hadiza', 'Bello',
  'Aisha', 'Kabiru', 'Maryam', 'Mustapha', 'Sa\'adatu', 'Garba', 'Binta', 'Yakubu', 'Rukayya', 'Aliyu',
  'Hauwa', 'Alhassan', 'Khadija', 'Salisu', 'Asmau', 'Lawal', 'Safiya', 'Suleiman', 'Nafisa', 'Danladi'
];

const FIRST_NAMES_OTHER = [
  'Effiong', 'Bassey', 'Iniobong', 'Ekaette', 'Osas', 'Eseosa', 'Osaro', 'Ivbade', 'Ejiro', 'Oghenekaro',
  'Tari', 'Ebipade', 'Precious', 'Blessing', 'Godswill', 'Mercy', 'Victor', 'Emmanuel', 'Grace', 'Daniel',
  'Joy', 'Samuel', 'David', 'Miracle', 'Promise', 'Gift', 'Faith', 'Goodness', 'Solomon', 'Esther'
];

const LAST_NAMES = [
  'Adeyemi', 'Okonkwo', 'Bello', 'Abubakar', 'Okafor', 'Ogundipe', 'Nwosu', 'Danjuma', 'Bassey', 'Eze',
  'Ajayi', 'Obi', 'Garba', 'Olawale', 'Igwe', 'Sanusi', 'Adewale', 'Egbede', 'Osagie', 'Okoro',
  'Balogun', 'Nwachukwu', 'Usman', 'Akinyemi', 'Anyanwu', 'Idris', 'Salami', 'Chukwu', 'Mustapha', 'Oladipo',
  'Effiong', 'Ojo', 'Utomi', 'Shehu', 'Adeleke', 'Amadi', 'Musa', 'Afolabi', 'Ogan', 'Gbadamosi',
  'Ekanem', 'Kolawole', 'Onuoha', 'Suleiman', 'Fashola', 'Okon', 'Orji', 'Yusuf', 'Soyinka', 'Umar'
];

const NIGERIAN_CITIES = [
  { city: 'Ikeja', state: 'Lagos' },
  { city: 'Lekki', state: 'Lagos' },
  { city: 'Surulere', state: 'Lagos' },
  { city: 'Yaba', state: 'Lagos' },
  { city: 'Abuja Central', state: 'FCT Abuja' },
  { city: 'Gwarinpa', state: 'FCT Abuja' },
  { city: 'Ibadan', state: 'Oyo' },
  { city: 'Kano', state: 'Kano' },
  { city: 'Enugu', state: 'Enugu' },
  { city: 'Port Harcourt', state: 'Rivers' },
  { city: 'Benin City', state: 'Edo' },
  { city: 'Kaduna', state: 'Kaduna' },
  { city: 'Aba', state: 'Abia' },
  { city: 'Calabar', state: 'Cross River' },
  { city: 'Owerri', state: 'Imo' },
  { city: 'Warri', state: 'Delta' },
  { city: 'Akure', state: 'Ondo' },
  { city: 'Abeokuta', state: 'Ogun' },
  { city: 'Ilorin', state: 'Kwara' },
  { city: 'Jos', state: 'Plateau' },
  { city: 'Asaba', state: 'Delta' },
  { city: 'Uyo', state: 'Akwa Ibom' },
  { city: 'Maiduguri', state: 'Borno' },
  { city: 'Sokoto', state: 'Sokoto' },
  { city: 'Lokoja', state: 'Kogi' },
  { city: 'Osogbo', state: 'Osun' },
  { city: 'Makurdi', state: 'Benue' },
  { city: 'Yola', state: 'Adamawa' }
];

const NIGERIAN_BANKS = [
  'Access Bank', 'GTBank', 'Zenith Bank', 'First Bank', 'OPay', 'Palmpay', 
  'Kuda Bank', 'Moniepoint', 'UBA', 'FCMB', 'Stanbic IBTC', 'Sterling Bank', 
  'Wema Bank (ALAT)', 'Fidelity Bank', 'Union Bank'
];

const COMMON_AMOUNTS = [31000, 32500, 35000, 38000, 40000, 42500, 45000, 48000, 50000, 54000, 58000, 62000, 65000];
const MODERATE_AMOUNTS = [70000, 75000, 82000, 88000, 95000, 100000, 110000, 125000];
const SCARCE_AMOUNTS = [145000, 165000, 180000, 210000, 250000];

const ALL_FIRST_NAMES = [
  ...FIRST_NAMES_YORUBA,
  ...FIRST_NAMES_IGBO,
  ...FIRST_NAMES_HAUSA,
  ...FIRST_NAMES_OTHER
];

// Deterministic seed pseudo-random generator so 500 records remain consistent across re-renders
function pseudoRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function generate500NigerianWithdrawals(): NigerianWithdrawal[] {
  const list: NigerianWithdrawal[] = [];
  const now = Date.now();

  for (let i = 0; i < 500; i++) {
    const fnIdx = Math.floor(pseudoRandom(i * 13 + 7) * ALL_FIRST_NAMES.length);
    const lnIdx = Math.floor(pseudoRandom(i * 17 + 11) * LAST_NAMES.length);
    const locationIdx = Math.floor(pseudoRandom(i * 23 + 19) * NIGERIAN_CITIES.length);
    const bankIdx = Math.floor(pseudoRandom(i * 29 + 31) * NIGERIAN_BANKS.length);
    
    // Weighted Amount Selector (70% Common 31k-65k, 20% Moderate 70k-125k, 10% Scarce 145k-250k)
    const weightRoll = pseudoRandom(i * 37 + 41);
    let amount = 35000;
    if (weightRoll < 0.70) {
      const idx = Math.floor(pseudoRandom(i * 41 + 7) * COMMON_AMOUNTS.length);
      amount = COMMON_AMOUNTS[idx];
    } else if (weightRoll < 0.90) {
      const idx = Math.floor(pseudoRandom(i * 43 + 13) * MODERATE_AMOUNTS.length);
      amount = MODERATE_AMOUNTS[idx];
    } else {
      const idx = Math.floor(pseudoRandom(i * 47 + 19) * SCARCE_AMOUNTS.length);
      amount = SCARCE_AMOUNTS[idx];
    }

    const firstName = ALL_FIRST_NAMES[fnIdx];
    const lastName = LAST_NAMES[lnIdx];
    const lastInitial = lastName.charAt(0) + '.';
    const location = NIGERIAN_CITIES[locationIdx];
    const bank = NIGERIAN_BANKS[bankIdx];

    // Minutes offset ranging from 1 minute up to 1440 minutes (24h)
    const minutesAgo = Math.floor(pseudoRandom(i * 43 + 53) * 1440) + 1;
    const timeDate = new Date(now - minutesAgo * 60 * 1000);

    let timeAgo = '';
    if (minutesAgo < 2) timeAgo = 'Just now';
    else if (minutesAgo < 60) timeAgo = `${minutesAgo} mins ago`;
    else {
      const hours = Math.floor(minutesAgo / 60);
      timeAgo = hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }

    list.push({
      id: `ng_wdr_${i + 1}`,
      name: `${firstName} ${lastInitial}`,
      city: location.city,
      state: location.state,
      bank,
      amount,
      timeAgo,
      timestamp: timeDate,
      verified: true
    });
  }

  // Sort by timestamp descending (newest first)
  return list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export const NIGERIAN_WITHDRAWALS_DATA = generate500NigerianWithdrawals();
