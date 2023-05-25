let SalesforceDocument=require('./index')
let sfDoc = new SalesforceDocument();

sfDoc.authbySession(
  "",//url
  ""//session id
);
sfDoc.download(`limit 2`);//where clauses