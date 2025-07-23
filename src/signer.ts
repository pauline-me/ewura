import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as pem from 'pem';
import * as dotenv from 'dotenv';

dotenv.config();

// Type definitions
export interface TransactionBody {
  tranId: string;
  apiSourceId: string;
  rctVerificationCode: string;
  ewuraLicenseNo: string;
  rctDate: string;
  rctTime: string;
  operatorTin: string;
  operatorVrn: string;
  operatorName: string;
  retailStationName: string;
  traSerialNo: string;
  productName: string;
  unitPrice: string;
  volume: string;
  amount: string;
  discountAmount: string;
  amountNew: string;
  buyerName: string;
  cardDesc: string;
}

export interface RegistrationBody {
  tranId: string;
  apiSourceId: string;
  retailStationName: string;
  ewuraLicenseNo: string;
  operatorTin: string;
  operatorVrn: string;
  operatorName: string;
  licenseeTraSerialNo: string;
  regionName: string;
  districtName: string;
  wardName: string;
  zone: string;
  contactPersonEmailAddress: string;
  contactPersonPhone: string;
}

export interface TankInventory {
  tankId: string;
  tankProdName: string;
  saleNumber: number;
  startVolume: number;
  deliveryVolume: number;
  saleVolume: number;
  measuredEndVolume: number;
  calculatedEndVolume: number;
  volumeDifference: number;
}

export interface DailySummaryBody {
  tranId: string;
  apiSourceId: string;
  ewuraLicenseNo: string;
  retailStationName: string;
  serialNo: string;
  reportId: string;
  reportNo: string;
  startDate: string;
  endDate: string;
  countOfTransactions: number;
  totalNetAmount: number;
  totalDiscount: number;
  totalAmount: number;
  totalVolume: number;
  totalPetrol: number;
  totalDiesel: number;
  totalKerosene: number;
  trnPetrol: number;
  trnDiesel: number;
  trnKerosene: number;
  unitPricePetrol: number;
  unitPriceDiesel: number;
  unitPriceKerosene: number;
  petrolTotalAmount: number;
  dieselTotalAmount: number;
  keroseneTotalAmount: number;
  totalNoTanks: number;
  regionName: string;
  districtName: string;
  wardName: string;
  tankInventory: TankInventory[];
}

type SignerCallback = (error: Error | null, xml?: string) => void;

function minifyXml(xml: string): string {
  return xml.replace(/>\s+</g, '><').trim();
}

export function ewuraRegistrationXml(body: RegistrationBody, cb: SignerCallback): void {
  const report = `<RetailStationRegistration>` +
    `<TranId>${body.tranId}</TranId>` +
    `<APISourceId>${body.apiSourceId}</APISourceId>` +
    `<RetailStationName>${body.retailStationName}</RetailStationName>` +
    `<EWURALicenseNo>${body.ewuraLicenseNo}</EWURALicenseNo>` +
    `<OperatorTin>${body.operatorTin}</OperatorTin>` +
    `<OperatorVrn>${body.operatorVrn}</OperatorVrn>` +
    `<OperatorName>${body.operatorName}</OperatorName>` +
    `<LicenseeTraSerialNo>${body.licenseeTraSerialNo}</LicenseeTraSerialNo>` +
    `<RegionName>${body.regionName}</RegionName>` +
    `<DistrictName>${body.districtName}</DistrictName>` +
    `<WardName>${body.wardName}</WardName>` +
    `<Zone>${body.zone}</Zone>` +
    `<ContactPersonEmailAddress>${body.contactPersonEmailAddress}</ContactPersonEmailAddress>` +
    `<ContactPersonPhone>${body.contactPersonPhone}</ContactPersonPhone>` +
    `</RetailStationRegistration>`;

  signXml(report, 'VendorSignature', cb);
}

export function generateTransactionXml(body: TransactionBody, cb: SignerCallback): void {
  const report = `<RetailerSaleTransaction>` +
    `<TranId>${body.tranId}</TranId>` +
    `<APISourceId>${body.apiSourceId}</APISourceId>` +
    `<RctVerificationCode>${body.rctVerificationCode}</RctVerificationCode>` +
    `<EWURALicenseNo>${body.ewuraLicenseNo}</EWURALicenseNo>` +
    `<RctDate>${body.rctDate}</RctDate>` +
    `<RctTime>${body.rctTime}</RctTime>` +
    `<OperatorTin>${body.operatorTin}</OperatorTin>` +
    `<OperatorVrn>${body.operatorVrn}</OperatorVrn>` +
    `<OperatorName>${body.operatorName}</OperatorName>` +
    `<RetailStationName>${body.retailStationName}</RetailStationName>` +
    `<TraSerialNo>${body.traSerialNo}</TraSerialNo>` +
    `<ProductName>${body.productName}</ProductName>` +
    `<UnitPrice>${body.unitPrice}</UnitPrice>` +
    `<Volume>${body.volume}</Volume>` +
    `<Amount>${body.amount}</Amount>` +
    `<DiscountAmount>${body.discountAmount}</DiscountAmount>` +
    `<AmountNew>${body.amountNew}</AmountNew>` +
    `<BuyerName>${body.buyerName}</BuyerName>` +
    `<CardDesc>${body.cardDesc}</CardDesc>` +
    `</RetailerSaleTransaction>`;

  signXml(report, 'VendorSignature', cb);
}

export function generateDailySummaryXml(body: DailySummaryBody, cb: SignerCallback): void {
  const tanks = body.tankInventory.map(tank => `
    <Tank>
      <TankID>${tank.tankId}</TankID>
      <TankProdName>${tank.tankProdName}</TankProdName>
      <SaleNumber>${tank.saleNumber}</SaleNumber>
      <StartVolume>${tank.startVolume}</StartVolume>
      <ATGDeliveryVolume>${tank.deliveryVolume}</ATGDeliveryVolume>
      <SaleVolume>${tank.saleVolume}</SaleVolume>
      <MeasuredEndVolume>${tank.measuredEndVolume}</MeasuredEndVolume>
      <CalculatedEndVolume>${tank.calculatedEndVolume}</CalculatedEndVolume>
      <VolumeDifference>${tank.volumeDifference}</VolumeDifference>
    </Tank>
  `).join('');

  const report = `
    <StationDaySummaryReport>
      <TranId>${body.tranId}</TranId>
      <APISourceId>${body.apiSourceId}</APISourceId>
      <EWURALicenseNo>${body.ewuraLicenseNo}</EWURALicenseNo>
      <RetailStationName>${body.retailStationName}</RetailStationName>
      <SerialNo>${body.serialNo}</SerialNo>
      <ReportId>${body.reportId}</ReportId>
      <ReportNo>${body.reportNo}</ReportNo>
      <StartDate>${body.startDate}</StartDate>
      <EndDate>${body.endDate}</EndDate>
      <CountOfTrasactions>${body.countOfTransactions}</CountOfTrasactions>
      <TotalNetAmount>${body.totalNetAmount}</TotalNetAmount>
      <TotalDiscount>${body.totalDiscount}</TotalDiscount>
      <TotalAmount>${body.totalAmount}</TotalAmount>
      <TotalVolume>${body.totalVolume}</TotalVolume>
      <TotalPetrol>${body.totalPetrol}</TotalPetrol>
      <TotalDiesel>${body.totalDiesel}</TotalDiesel>
      <TotalKerosene>${body.totalKerosene}</TotalKerosene>
      <TRNPetrol>${body.trnPetrol}</TRNPetrol>
      <TRNDiesel>${body.trnDiesel}</TRNDiesel>
      <TRNKerosene>${body.trnKerosene}</TRNKerosene>
      <UnitPricePetrol>${body.unitPricePetrol}</UnitPricePetrol>
      <UnitPriceDiesel>${body.unitPriceDiesel}</UnitPriceDiesel>
      <UnitPriceKerosene>${body.unitPriceKerosene}</UnitPriceKerosene>
      <PetrolTotalAmount>${body.petrolTotalAmount}</PetrolTotalAmount>
      <DieselTotalAmount>${body.dieselTotalAmount}</DieselTotalAmount>
      <KeroseneTotalAmount>${body.keroseneTotalAmount}</KeroseneTotalAmount>
      <TotalNoTanks>${body.totalNoTanks}</TotalNoTanks>
      <RegionName>${body.regionName}</RegionName>
      <DistrictName>${body.districtName}</DistrictName>
      <WardName>${body.wardName}</WardName>
      <TankInventory>${tanks}</TankInventory>
    </StationDaySummaryReport>
  `;

  signXml(report, 'VendorSignature', cb);
}

function signXml(xmlContent: string, signatureTag: string, cb: SignerCallback): void {
  const pfxPath = path.join(__dirname, '../certs/advatech.pfx');
  const pfxBuffer = fs.readFileSync(pfxPath);
  const password = process.env.EWURA_P12PASSWORD;
  
  if (!password) {
    return cb(new Error('EWURA_P12PASSWORD environment variable is not set'));
  }
  
  const cleaned = minifyXml(xmlContent);

  pem.readPkcs12(pfxBuffer, { p12Password: password }, (err: Error | null, cert: pem.Pkcs12ReadResult) => {
    if (err) return cb(err);

    try {
      const sign = crypto.createSign("SHA1");
      sign.update(cleaned);
      sign.end();
      const signature = sign.sign(cert.key).toString("base64");

      const xml = `<?xml version="1.0" encoding="UTF-8"?><NPGIS>${cleaned}<${signatureTag}>${signature}</${signatureTag}></NPGIS>`;
      cb(null, xml);
    } catch (e) {
      cb(e as Error);
    }
  });
}
