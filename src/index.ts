import { 
  ewuraRegistrationXml, 
  generateTransactionXml, 
  generateDailySummaryXml,
  TransactionBody,
  RegistrationBody,
  DailySummaryBody,
  TankInventory
} from './signer';

// Utility function to generate ISO formatted dates
function generateDateRange(daysBack: number = 0): { startDate: string; endDate: string } {
  const now = new Date();
  
  // Calculate start date (daysBack days ago)
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - daysBack);
  
  // End date is current date
  const endDate = new Date(now);
  
  return {
    startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
    endDate: endDate.toISOString().split('T')[0]      // YYYY-MM-DD format
  };
}

// Generate dates for today (0 days back)
const todayDates = generateDateRange(0);

// Generate dates for a range (e.g., 7 days back to today)
const weeklyDates = generateDateRange(7);

// Existing Payload – Transaction + Registration
const body: TransactionBody & RegistrationBody = {
  tranId: '1',
  apiSourceId: '109272930_SPAdv2023T',
  rctVerificationCode: '5EC70419851',
  ewuraLicenseNo: 'PRL-2010-715',
  rctDate: '18/07/2025',
  rctTime: '11:08:18',
  operatorTin: '109272930',
  operatorName: 'OMBOZA',
  licenseeTraSerialNo: '10TZ176715',
  operatorVrn: '40005334W',
  retailStationName: 'ADVATECH FILLING STATION',
  traSerialNo: '10TZ176714',
  productName: 'PETROL',
  unitPrice: '2700',
  volume: '3.5',
  amount: '9450',
  discountAmount: '0',
  amountNew: '9450',
  buyerName: 'JUMA',
  cardDesc: 'NMB BANK CARD',
  regionName: 'Dar es Salaam',
  districtName: 'KINONDONI',
  wardName: 'KINONDONI',
  zone: 'EAST',
  contactPersonEmailAddress: 'ericprosper5@gmail.com',
  contactPersonPhone: '0754100300'
};

// Tank inventory data
const tankInventory: TankInventory[] = [
  {
    tankId: '1',
    tankProdName: 'PETROL',
    saleNumber: 50,
    startVolume: 10000,
    deliveryVolume: 5000,
    saleVolume: 4000,
    measuredEndVolume: 10900,
    calculatedEndVolume: 11000,
    volumeDifference: 100
  },
  {
    tankId: '2',
    tankProdName: 'DIESEL',
    saleNumber: 40,
    startVolume: 8000,
    deliveryVolume: 4000,
    saleVolume: 3000,
    measuredEndVolume: 8950,
    calculatedEndVolume: 9000,
    volumeDifference: 50
  },
  {
    tankId: '3',
    tankProdName: 'KEROSENE',
    saleNumber: 30,
    startVolume: 6000,
    deliveryVolume: 3000,
    saleVolume: 2000,
    measuredEndVolume: 6980,
    calculatedEndVolume: 7000,
    volumeDifference: 20
  }
];

// Daily Summary Payload
const dailySummaryPayload: DailySummaryBody = {
  tranId: '1',
  apiSourceId: '109272930_SPAdv2023T',
  ewuraLicenseNo: 'PRL-2010-715',
  retailStationName: 'ADVATECH FILLING STATION',
  serialNo: '10TZ176715',
  reportId: '20250718',
  reportNo: '20250718',
  startDate: todayDates.startDate,
  endDate: todayDates.endDate,
  countOfTransactions: 120,
  totalNetAmount: 320000.50,
  totalDiscount: 1500.00,
  totalAmount: 318500.50,
  totalVolume: 118.75,
  totalPetrol: 85.00,
  totalDiesel: 25.50,
  totalKerosene: 8.25,
  trnPetrol: 80.00,
  trnDiesel: 22.50,
  trnKerosene: 7.00,
  unitPricePetrol: 2700.00,
  unitPriceDiesel: 2650.00,
  unitPriceKerosene: 2500.00,
  petrolTotalAmount: 229500.00,
  dieselTotalAmount: 66375.00,
  keroseneTotalAmount: 20625.50,
  totalNoTanks: 3,
  regionName: 'Dar es Salaam',
  districtName: 'Kinondoni',
  wardName: 'Kinondoni',
  tankInventory
};

// Generate EWURA Registration XML
ewuraRegistrationXml(body, (err, xml) => {
  if (err) {
    console.error("❌ Error generating registration XML:", err);
  } else {
    console.log(" Ewura Registration:\n\n", xml, "\n");
  }
});

// Generate Transaction XML
generateTransactionXml(body, (err, signedXml) => {
  if (err) {
    console.error(" Error generating transaction XML:", err);
  } else {
    console.log("Sending Ewura Transaction:\n\n", signedXml, "\n");
  }
});

// Generate Daily Summary XML
generateDailySummaryXml(dailySummaryPayload, (err, summaryXml) => {
  if (err) {
    console.error("❌ Error generating daily summary XML:", err);
  } else {
    console.log("✅ Sending Ewura Daily Summary:\n\n", summaryXml, "\n");
  }
});

// Example usage:
console.log("📅 Generated Dates:");
console.log("Today's dates:", todayDates);
console.log("Weekly dates:", weeklyDates);
