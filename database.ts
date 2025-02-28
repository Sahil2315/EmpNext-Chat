const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
let connectionString = process.env.PG_CONNECT;
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false },
});

function allMessages() {
  return new Promise((resolve, reject) => {
    pool.query(
      `select * from messages where team = 0 order by msgid`,
      (err, result) => {
        if (err) {
          reject(err);
        }
        resolve({
          querySuccess: true,
          result: result.rows,
        });
      }
    );
  });
}

function teamMessages(teamNumber) {
  return new Promise((resolve, reject) => {
    pool.query(
      `select * from messages where team = ${teamNumber} order by msgid`,
      (err, result) => {
        if (err) {
          reject(err);
        }
        resolve({
          querySuccess: true,
          result: result.rows,
        });
      }
    );
  });
}

function newMessage(details) {
  return new Promise((resolve, reject) => {
    pool.query(
      `insert into messages (empid, ename, date, time, msgcont, team) values('${details.empid}', '${details.ename}', now(), now(), '${details.msgCont}', ${details.team})`,
      (err, result) => {
        if (err) {
          reject(err);
        }
        resolve({
          querySuccess: true,
          result: result,
        });
      }
    );
  });
}

module.exports = { allMessages, teamMessages, newMessage };
