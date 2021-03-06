const express = require('express'); 
const app = express();     
const bodyParser = require ('body-parser'); 
const porta = 8080;    //Porta onde vai ser aberto o server
const isUrl = require ('is-url');
const fs = require ('fs');
var mysql = require('mysql');

var linkEnc = "";
var clicks = clicksF();
var linkfeito;

var con = mysql.createConnection({
  host: "localhost",    //host
  user: "root",    //Usuario
  password: "admin",    //Senha
  database: "mydb"   //Nome do Banco de Dado
});

app.use (bodyParser.urlencoded ({extended: true}));
app.use (express.static('views/public'));

app.set ('view engine','ejs');


app.get ('/', function (req, res)
{
  clicks = clicksF(clicks);
  res.render('index', {linkEnc : linkEnc, clicks : clicks});
});

app.post ('/', function (req, res) 
{     
    var link = req.body.link;
    linkfeito = fazerLink();
    verificar(verificar2, linkfeito, link, res); 
});

app.get("/:linkCurto", function (req, res)  //Chama o linkOriginal com base no linkCurto
{  
    const linkC = req.params.linkCurto;
    pegarLinkCurto(pegarLinkCurto2, linkC, res);
});

function pegarLinkCurto(callback,linkC, res)
{   //Verifica se tem o Link que o usuario esta tentado usar.
  var sql = 'SELECT COUNT(*) AS total FROM links WHERE linkCurto =  ' + mysql.escape(linkC);    //Vai retornar quantos linksCurtos igual que o usuario esta entrando.
  con.query(sql, function(err, result)
  {
    if (err) throw err;
    if (result[0].total == 0)
    {     //Se o resultado for 0, não tem o link no Banco de Dado.
      var resultado = "0";
      callback(resultado, res);    //Envia o "0" para a função pegar pegarLinkCurto2
    }
    else
    {   //Se o resultado não for 0
      var sql = 'SELECT linkOriginal FROM links WHERE linkCurto = ' + mysql.escape(linkC);   //Pega o linkOriginal do linkCurto dentro do banco de dado
      con.query(sql,  function (err, result) 
      {
        if (err) throw err;
        var resultado = result[0].linkOriginal;  //Define o resultado == o linkOriginal
        callback(resultado, res)  //Envia o linkOriginal para a função 
      });
    }
  });
  
}

function pegarLinkCurto2(link, res){
  if (link != "0") {    //Se for 0, ou seja, tem um resultado, ele pega o link , que é o linkOriginal recebido, e direciona para aquele link
    addClicks(clicks);
    res.redirect(link);
  }
  else if(link == "0"){   //Se link == 0 ele vai carregar a pagina principal, pois não encotrou resultado
    res.render('index', {linkEnc : linkEnc, clicks : clicks});
  }
  else{    //Se link == 0 ele vai carregar a pagina principal, pois não encotrou resultado
    res.render('index', {linkEnc : linkEnc, clicks : clicks});
  }
}

function fazerLink() 
{   //Cria 5 numero/letras aleatorias
  var link = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";   //Letras e numeros possiveis de ser usados
  
  for (var i = 0; i < 5; i++) link += possible.charAt(Math.floor(Math.random() * possible.length)); //Entra em um loop de for para ficar adicionado uma letra aleatoria até chegar em 5 letras totais

  return link;   //retorna as 5 letras
}

function verificar(callback, linkfeito, link, res)
{    //Verifica se ja tem o linkCurto, gerado pela função fazerLink(), ja existe no banco de dado
    var sql = 'SELECT * FROM links WHERE linkCurto = ' + mysql.escape(linkfeito);
    con.query(sql,  function (err, result) 
      {
        if (err) throw err;
          console.log(result);
          callback(result, linkfeito, link, res)
      });
}

function verificar2(resultado, linkfeito, link, res)
{    
    if (resultado == "")
    { // Se não tiver o linkCurto no banco de dado
      if (isUrl(link))
      {   //Verifica se é um link o texto inserido pelo usuario usando o Package is-url
        salvar(linkfeito, link);  //Se for um link ele chama a função de salvar o link
        linkEnc = "Seu link curtinho: " + linkfeito;
      }
      else
      {
        linkEnc = "Por favor colocar um link valido";  //Se não for ele responde com uma mensagem de 
      }

      res.render('index', {linkEnc : linkEnc, clicks : clicks}); 
    }
    else{   //Se tiver o linkCurto ja no banco de dado, ele repete o processo de criar um linkCurto ate não ter um repetido
      linkfeito = fazerLink();
      verificar3(linkfeito, link, res);
    }
}

function salvar(linkfeito, link) //Salva o linkCurto e linkOriginal no banco de dado
{   
    var sql = "INSERT INTO links (linkOriginal, linkCurto, hits) VALUES ?";
    var values = [
      [link, linkfeito, 0]
    ];
    con.query(sql, [values], function (err, result) {
      if (err) throw err;
      console.log("Number of records inserted: " + result.affectedRows);
    });
}
  
function clicksF()
{
  var clicksS = fs.readFileSync('./clicks.json', 'utf-8', function (err, data) 
  {
    if(err) throw err;
    console.log(data);
    var clicksS = JSON.stringify(data);
    return clicksS;
  });
  
  console.log(clicksS);
  return clicksS;
} 

function addClicks(clicks)
{
  clicks++;
  fs.writeFile('./clicks.json', clicks, function (err) {
    if (err) throw err;
  });
}

app.listen(porta, function ()  //Abre o server na porta defenida na variavel porta la em cima
{   
  console.log('Online Porta: ' + porta);
});

con.connect(function(err)  //Faz a conecção com o banco de dado
{  
  if (err) throw err;
  console.log("Connected!");  
});
