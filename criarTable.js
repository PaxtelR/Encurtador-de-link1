var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",             //Usuario
  password: "admin",        //Senha
  database: "mydb2"         //Nome do Banco de Dado
});
var sql = "CREATE TABLE links (id INT AUTO_INCREMENT PRIMARY KEY, linkOriginal VARCHAR(255), linkCurto VARCHAR(255)), hits INT"; // Cria as colunos(id, linkOrigial, linkCurto, hits)
con.query(sql, function (err, result) {
  if (err) throw err;
  console.log("Table created");
});

con.connect(function(err) {    //Conecta no banco de dado
  if (err) throw err;
  console.log("Conectado!");
 
});