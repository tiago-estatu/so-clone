export class Recomendation {    
    cdsStoreId: number;
    cdsMainSupplierId: number;
    cdsSkuId: number;    
    qtRoqQty: number;
    qtNeedQty: number;
    qtWoqQty: number;
    sgWoqStatus: string;
    dtCalculationDate: Date;
    dtApproveDateTime: Date;
    cdsApproveUserId: number;    
    cdsSupplierId: number;
    sgStockCat: string;
    qtWhLeadTime: number;
    qtSupplierLeadTime: number;
    txBatchAudit: string;
    txRoqAttr01Desc: string;
    sgRecordStatus: string;
    cdsCreateUserId: number;
    dtCreateDateTime: Date; 
    cdsLastUpdateUserId: number;
    dtLastUpdateDateTime: Date;
  }