import express from "express";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "BookShelf",
  password: "@ryan2004",
  port: 5432,
});
db.connect();



app.get("/", async (req, res) => {

    const result = await db.query("select id , title , author , ratings , cover_id , to_char(date , 'YYYY-MM-DD') as date , summary from books")
    console.log(result.rows);

    res.render("index.ejs" , {books : result.rows});
});

app.post("/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/addnew", async (req, res) => {
  console.log(req.body);
  try {

    const result = await axios.get("https://openlibrary.org/search.json", {
      params: { title: req.body.title, author: req.body.author },
    });
    
    const data = result.data;
    if(!data.docs[0].cover_i)throw new Error("Cover id not found");

    // console.log(data.docs[0].cover_i);
    // console.log(typeof(data.docs[0].cover_i));

    // console.log(data.docs[0].author_name[0]);
    const author_string = data.docs[0].author_name.join();
    // console.log(author_string);
    
    // console.log(data.docs[0].title);
    // console.log(req.body.rating);
    const rating = parseInt(req.body.rating);
    // console.log(typeof(rating));
    const today = new Date().toISOString().split("T")[0];
    console.log(today);

    try{
        await db.query("insert into books values (DEFAULT,$1,$2,$3,$4,$5,$6)",
            [data.docs[0].title, author_string, rating, data.docs[0].cover_i,today,req.body.summary]);

        res.redirect("/");

    }

    catch(error){
        console.log(error.message);
        res.render("new.ejs",{error: "Already Present"})
    }
    

   
  } catch (error) {
    res.render("new.ejs" , {error: "Book Not Found!"});
  }
});

app.listen(port, () => {
  console.log(`the server is running on port: ${port}`);
});
