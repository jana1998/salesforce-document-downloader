const jsforce = require("jsforce");
const axios = require("axios");
const converter = require("json-2-csv");
var fs = require("fs");

class SalesforceDocument {
  constructor() {
    this.baseDir = "documents/";
    this.API_VERSION = "54.0";
    this.baseQuery = `select id, name,createddate, Folder.name from Document`;
    this.jsforce = jsforce;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir);
    }
  }
  getUser() {}
  async authbySession(url, sid) {
    this.orgConn = new this.jsforce.Connection({
      serverUrl: url,
      sessionId: sid,
      version: this.API_VERSION,
    });
    //console.log(await this.orgConn.identity())
  }
  async queryAll(query) {
    let allLogs = await this.orgConn.query(query);
    let totalSize = allLogs.totalSize;
    let done = allLogs.done;
    let allRecordsList = [];
    console.log(
      "First Query Complete",
      allLogs.records.length,
      "Total Size",
      totalSize
    );
    allRecordsList.push(...allLogs.records);
    while (!done) {
      console.log("Querying More", allLogs.nextRecordsUrl);
      allLogs = await this.orgConn.queryMore(allLogs.nextRecordsUrl);
      allRecordsList.push(...allLogs.records);
      done = allRecordsList.done;
    }
    console.log("All Query Done", allRecordsList.length);
    return allRecordsList;
  }
  async download(query) {
    
    query = this.baseQuery + " " + query;
    
    let records = await this.queryAll(query);
    console.log(records)
    await this.createCSVFileFromList(records, "documents");
    console.log(records)
    let idList = [];
    for (let i of records) {
      console.log("Resolving", i.Name);
      let id = i.Id;
      idList.push(id);
      let name = i.Name;
      let spaceSplit = name.split("/").join("-");

      console.log(spaceSplit);
      name = spaceSplit.split(" ").join("");

      let fileOut = fs.createWriteStream(
        `${this.baseDir}/${name.split("|").join("-")}`
      );
      await this.orgConn
        .sobject("Document")
        .record(id)
        .blob("Body")
        .pipe(fileOut);
    }
  }
  async createCSVFileFromList(list, name) {
    console.log("Writing to CSV File with length", list.length, name);
    let csvContent = await converter.json2csv(list);
    await this.createCSVFile(csvContent, "EvtALL");
  }
  async createCSVFile(content, name) {
    fs.writeFileSync(
      `${this.baseDir}${name}_${new Date().getTime()}.json`,
      content
    );
    return true;
  }
}
module.exports = SalesforceDocument

