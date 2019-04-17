var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",             //Usuario
  password: "admin",        //Senha
});

con.query("CREATE DATABASE mydb2", function (err, result) {   //Cria o banco de dado 
  if (err) throw err;
  console.log("Database created");
});

con.connect(function(err) {    //Conecta no banco de dado
  if (err) throw err;
  console.log("Conectado!");
 
});