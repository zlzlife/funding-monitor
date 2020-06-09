import BaseCrawler, { EquityResponse } from "@/crawler/BaseCrawler";
import { get } from "@/utils/request";
const DOMAIN = "http://fund.10jqka.com.cn/";
const BASE_URL = `${DOMAIN}data/client/myfund/`;
export default class FlushCrawler extends BaseCrawler {
  public get fundViewUrl(): string {
    return `${DOMAIN}${this.fundId}`;
  }
  public get fundDataPageUrl(): string {
    return `${BASE_URL}${this.fundId}`;
  }

  private addPercent(data: string) {
    return `${data}%`;
  }
  private async getPredictData(hqcode: string) {
    const url = `http://gz-fund.10jqka.com.cn/?module=api&controller=index&action=chart&info=vm_fd_${hqcode}&start=0930&_=${new Date().getTime()}`;
    const predictData = {
      equity: "N/A",
      diff: "N/A",
      rate: "N/A"
    };
    const res = await get(url);

    if (!res.data) {
      return predictData;
    }
    // vm_fd_XXXX='2020-04-09;0930-1130,1300-1500|2020-04-10~~'
    // vm_fd_JBY143='2020-04-09;0930-1130,1300-1500|2020-04-10~1.2661~0930,1.26678,1.2661,0.000; ...
    const numReg = `[-+]?([0-9]*.[0-9]+|[0-9]+)`;
    const dataReg = new RegExp(`(\\d{4},${numReg},${numReg},${numReg})`, "g");
    const dataArr = res.data.match(dataReg);
    if (!dataArr) {
      return predictData;
    }
    const lastData = (dataArr && dataArr.shift().split(",")) || null;
    if (!lastData) return predictData;
    predictData.equity = (+lastData[1]).toFixed(4);
    predictData.diff = (+lastData[1] - +lastData[2]).toFixed(4);
    predictData.rate =
      (((+lastData[1] - +lastData[2]) / +lastData[2]) * 100).toFixed(2) + "%";
    return predictData;
  }

  public async getData(): Promise<EquityResponse | null> {
    if (this.loading) return null;
    this.loading = true;
    const { data } = await get(this.fundDataPageUrl);
    const response: EquityResponse = {
      name: "",
      equity: "N/A",
      dayGrowthRate: "N/A",
      lastOneMonth: "N/A",
      lastThreeMonth: "N/A",
      lastSixMonth: "N/A",
      lastYear: "N/A",
      lastThreeYear: "N/A",
      sinceEstablishment: "N/A",
      predictEquity: "N/A",
      predictDiff: "N/A",
      predictDayGrowthRate: "N/A"
    };
    if (!data.data || !data.data.length) {
      this.loading = false;
      return response;
    }
    const FundData = data.data[0];
    const hqcode = FundData.hqcode;
    const predictData: {
      equity: string;
      diff: string;
      rate: string;
    } = await this.getPredictData(hqcode);
    response.name = FundData.name;
    response.equity = FundData.net;
    response.dayGrowthRate = this.addPercent(FundData.rate);
    response.lastOneMonth = this.addPercent(FundData.month);
    response.lastThreeMonth = this.addPercent(FundData.tmonth);
    response.lastSixMonth = this.addPercent(FundData.hyear);
    response.lastYear = this.addPercent(FundData.year);
    response.lastThreeYear = this.addPercent(FundData.tyear);
    response.sinceEstablishment = "N/A";
    // vm_fd_JSZ424='2020-04-09;0930-1130,1300-1500|2020-04-10~0.9851~0930,0.98696,0.9851,0.000;0931,0.98632,0.9851,0.000;0932,0.98555,0.9851,0.000;0933,0.98540,0.9851,0.000;0934,0.98558,0.9851,0.000;0935,0.98548,0.9851,0.000;0936,0.98450,0.9851,0.000;0937,0.98434,0.9851,0.000;0938,0.98376,0.9851,0.000;0939,0.98372,0.9851,0.000;0940,0.98391,0.9851,0.000;0941,0.98328,0.9851,0.000;0942,0.98328,0.9851,0.000;0943,0.98342,0.9851,0.000;0944,0.98297,0.9851,0.000;0945,0.98308,0.9851,0.000;0946,0.98323,0.9851,0.000;0947,0.98266,0.9851,0.000;0948,0.98324,0.9851,0.000;0949,0.98329,0.9851,0.000;0950,0.98294,0.9851,0.000;0951,0.98235,0.9851,0.000;0952,0.98265,0.9851,0.000;0953,0.98278,0.9851,0.000;0954,0.98254,0.9851,0.000;0955,0.98235,0.9851,0.000;0956,0.98292,0.9851,0.000;0957,0.98288,0.9851,0.000;0958,0.98287,0.9851,0.000;0959,0.98299,0.9851,0.000;1000,0.98267,0.9851,0.000;1001,0.98230,0.9851,0.000;1002,0.98281,0.9851,0.000;1003,0.98252,0.9851,0.000;1004,0.98213,0.9851,0.000;1005,0.98268,0.9851,0.000;1006,0.98292,0.9851,0.000;1007,0.98249,0.9851,0.000;1008,0.98268,0.9851,0.000;1009,0.98248,0.9851,0.000;1010,0.98262,0.9851,0.000;1011,0.98287,0.9851,0.000;1012,0.98282,0.9851,0.000;1013,0.98345,0.9851,0.000;1014,0.98393,0.9851,0.000;1015,0.98436,0.9851,0.000;1016,0.98396,0.9851,0.000;1017,0.98520,0.9851,0.000;1018,0.98578,0.9851,0.000;1019,0.98461,0.9851,0.000;1020,0.98564,0.9851,0.000;1021,0.98725,0.9851,0.000;1022,0.98836,0.9851,0.000;1023,0.98786,0.9851,0.000;1024,0.98734,0.9851,0.000;1025,0.98779,0.9851,0.000;1026,0.98684,0.9851,0.000;1027,0.98717,0.9851,0.000;1028,0.98748,0.9851,0.000;1029,0.98719,0.9851,0.000;1030,0.98710,0.9851,0.000;1031,0.98718,0.9851,0.000;1032,0.98764,0.9851,0.000;1033,0.98769,0.9851,0.000;1034,0.98914,0.9851,0.000;1035,0.98904,0.9851,0.000;1036,0.98841,0.9851,0.000;1037,0.98843,0.9851,0.000;1038,0.98862,0.9851,0.000;1039,0.98857,0.9851,0.000;1040,0.98782,0.9851,0.000;1041,0.98761,0.9851,0.000;1042,0.98794,0.9851,0.000;1043,0.98849,0.9851,0.000;1044,0.98792,0.9851,0.000;1045,0.98766,0.9851,0.000;1046,0.98758,0.9851,0.000;1047,0.98811,0.9851,0.000;1048,0.98863,0.9851,0.000;1049,0.98816,0.9851,0.000;1050,0.98899,0.9851,0.000;1051,0.98918,0.9851,0.000;1052,0.98909,0.9851,0.000;1053,0.98897,0.9851,0.000;1054,0.98908,0.9851,0.000;1055,0.98897,0.9851,0.000;1056,0.98907,0.9851,0.000;1057,0.98916,0.9851,0.000;1058,0.98855,0.9851,0.000;1059,0.98793,0.9851,0.000;1100,0.98797,0.9851,0.000;1101,0.98799,0.9851,0.000;1102,0.98790,0.9851,0.000;1103,0.98819,0.9851,0.000;1104,0.98794,0.9851,0.000;1105,0.98815,0.9851,0.000;1106,0.98846,0.9851,0.000;1107,0.98834,0.9851,0.000;1108,0.98839,0.9851,0.000;1109,0.98827,0.9851,0.000;1110,0.98826,0.9851,0.000;1111,0.98863,0.9851,0.000;1112,0.98894,0.9851,0.000;1113,0.98924,0.9851,0.000;1114,0.98897,0.9851,0.000;1115,0.98880,0.9851,0.000;1116,0.98857,0.9851,0.000;1117,0.98840,0.9851,0.000;1118,0.98743,0.9851,0.000;1119,0.98735,0.9851,0.000;1120,0.98753,0.9851,0.000;1121,0.98795,0.9851,0.000;1122,0.98756,0.9851,0.000;1123,0.98716,0.9851,0.000;1124,0.98810,0.9851,0.000;1125,0.98747,0.9851,0.000;1126,0.98708,0.9851,0.000;1127,0.98783,0.9851,0.000;1128,0.98778,0.9851,0.000;1129,0.98738,0.9851,0.000;1130,0.98718,0.9851,0.000;1300,0.98726,0.9851,0.000;1301,0.98726,0.9851,0.000;1302,0.98737,0.9851,0.000;1303,0.98690,0.9851,0.000;1304,0.98649,0.9851,0.000;1305,0.98619,0.9851,0.000;1306,0.98620,0.9851,0.000;1307,0.98687,0.9851,0.000;1308,0.98653,0.9851,0.000;1309,0.98637,0.9851,0.000;1310,0.98647,0.9851,0.000;1311,0.98619,0.9851,0.000;1312,0.98696,0.9851,0.000;1313,0.98700,0.9851,0.000;1314,0.98696,0.9851,0.000;1315,0.98684,0.9851,0.000;1316,0.98636,0.9851,0.000;1317,0.98669,0.9851,0.000;1318,0.98604,0.9851,0.000;1319,0.98634,0.9851,0.000;1320,0.98642,0.9851,0.000;1321,0.98656,0.9851,0.000;1322,0.98631,0.9851,0.000;1323,0.98616,0.9851,0.000;1324,0.98603,0.9851,0.000;1325,0.98571,0.9851,0.000;1326,0.98583,0.9851,0.000;1327,0.98601,0.9851,0.000;1328,0.98607,0.9851,0.000;1329,0.98516,0.9851,0.000;1330,0.98536,0.9851,0.000;1331,0.98453,0.9851,0.000;1332,0.98455,0.9851,0.000;1333,0.98507,0.9851,0.000;1334,0.98425,0.9851,0.000;1335,0.98383,0.9851,0.000;1336,0.98348,0.9851,0.000;1337,0.98408,0.9851,0.000;1338,0.98384,0.9851,0.000;1339,0.98377,0.9851,0.000;1340,0.98413,0.9851,0.000;1341,0.98416,0.9851,0.000;1342,0.98412,0.9851,0.000;1343,0.98457,0.9851,0.000;1344,0.98396,0.9851,0.000;1345,0.98438,0.9851,0.000;1346,0.98424,0.9851,0.000;1347,0.98418,0.9851,0.000;1348,0.98432,0.9851,0.000;1349,0.98397,0.9851,0.000;1350,0.98458,0.9851,0.000;1351,0.98413,0.9851,0.000;1352,0.98430,0.9851,0.000;1353,0.98388,0.9851,0.000;1354,0.98381,0.9851,0.000;1355,0.98380,0.9851,0.000;1356,0.98365,0.9851,0.000;1357,0.98395,0.9851,0.000;1358,0.98345,0.9851,0.000;1359,0.98342,0.9851,0.000;1400,0.98345,0.9851,0.000;1401,0.98354,0.9851,0.000;1402,0.98313,0.9851,0.000;1403,0.98285,0.9851,0.000;1404,0.98302,0.9851,0.000;1405,0.98259,0.9851,0.000;1406,0.98296,0.9851,0.000;1407,0.98301,0.9851,0.000;1408,0.98327,0.9851,0.000;1409,0.98414,0.9851,0.000;1410,0.98433,0.9851,0.000;1411,0.98461,0.9851,0.000;1412,0.98421,0.9851,0.000;1413,0.98365,0.9851,0.000;1414,0.98333,0.9851,0.000;1415,0.98311,0.9851,0.000;1416,0.98500,0.9851,0.000;1417,0.98482,0.9851,0.000;1418,0.98506,0.9851,0.000;1419,0.98446,0.9851,0.000;1420,0.98450,0.9851,0.000;1421,0.98415,0.9851,0.000;1422,0.98475,0.9851,0.000;1423,0.98410,0.9851,0.000;1424,0.98395,0.9851,0.000;1425,0.98413,0.9851,0.000;1426,0.98377,0.9851,0.000;1427,0.98343,0.9851,0.000;1428,0.98362,0.9851,0.000;1429,0.98371,0.9851,0.000;1430,0.98339,0.9851,0.000;1431,0.98463,0.9851,0.000;1432,0.98466,0.9851,0.000;1433,0.98466,0.9851,0.000;1434,0.98495,0.9851,0.000;1435,0.98458,0.9851,0.000;1436,0.98475,0.9851,0.000;1437,0.98428,0.9851,0.000;1438,0.98456,0.9851,0.000;1439,0.98464,0.9851,0.000;1440,0.98483,0.9851,0.000;1441,0.98433,0.9851,0.000;1442,0.98398,0.9851,0.000;1443,0.98374,0.9851,0.000;1444,0.98395,0.9851,0.000;1445,0.98363,0.9851,0.000;1446,0.98369,0.9851,0.000;1447,0.98445,0.9851,0.000;1448,0.98398,0.9851,0.000;1449,0.98414,0.9851,0.000;1450,0.98483,0.9851,0.000;1451,0.98452,0.9851,0.000;1452,0.98506,0.9851,0.000;1453,0.98516,0.9851,0.000;1454,0.98546,0.9851,0.000;1455,0.98488,0.9851,0.000;1456,0.98524,0.9851,0.000;1457,0.98487,0.9851,0.000;1458,0.98480,0.9851,0.000;1459,0.98480,0.9851,0.000;1500,0.98485,0.9851,0.000'
    response.predictEquity = predictData.equity;
    response.predictDiff = predictData.diff;
    response.predictDayGrowthRate = predictData.rate;
    this.loading = false;
    return response;
  }
}