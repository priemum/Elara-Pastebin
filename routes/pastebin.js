const Router = require("express-promise-router");
const { extname } = require("path");
const router = new Router();
const moment = require('moment');
let {website} = require('../config');
const Schema = require('../Schema');
router.get("/", (req, res) => {
  return res.render("pastebin.ejs");
});
router.get("/:id", async(req, res) => {
  const { id } = req.params;
  if(!id) return res.status(400).render("error.ejs", {
    message: "ID must be provided"
  });
  const ext = extname(id).slice(1);
  let name = id;
  if(ext) name = name.substring(0, name.length - ext.length - 1);
  const db = req.app.db;
  const data = await db.findOne({ id: name });
  if(!data) return res.status(404).render("error.ejs", {
    message: "Could not find the specified pastebin"
  });
  return res.render("paste.ejs", { content: data.content, lang: ext || "js" });
});
router.get("/api/:id", async(req, res) => {
  const { id } = req.params;
  if(!id) return res.status(400).render("error.ejs", {
    message: "ID must be provided"
  });
  const ext = extname(id).slice(1);
  let name = id;
  if(ext) name = name.substring(0, name.length - ext.length - 1);
  const db = req.app.db;
  const data = await db.findOne({ id: name });
  if(!data) return res.status(404).render("error.ejs", {
    message: "Could not find the specified pastebin"
  });
  return res.json({id: name, content: data.content, created_at: data.time, expire: data.expire});
});
router.post("/", async(req, res) => {
  if(!req.body.password || req.body.password !== req.app.config.pastebin) return res.status(401).render("error.ejs", {
    message: "Invalid password.. now go bugger off... "
  });
  const { content } = req.body;
  if(!content || typeof content !== "string") return res.status(400).render("error.ejs", {
    message: "Missing content or is not a string"
  });
  const id = Date.now().toString(36);
  let expire = moment().add(604800000, 'ms').toDate()
  await new Schema({ id, content: content.trim(), time: new Date(), expire: expire}).save().catch(() => {});
  return res.redirect(`/pastebin/${id}`);
});
router.post("/json", async(req, res) => {
  const auth = req.get("Authorization");
  if(!auth || auth !== req.app.config.pastebin) return res.status(401).json({ message: "Unauthorized" });
  const { content } = req.body;
  if(!content || typeof content !== "string") return res.status(400).json({ message: "Content missing or not a string" });
  const id = Date.now().toString(36);
  const db = req.app.db;
  let expire = moment().add(604800000, 'ms').toDate()
  await new Schema({ id, content: content.trim(), time: new Date(), expire: expire }).save().catch(() => {});
  return res.json({ id, url: `${website}/pastebin/${id}` });
});
router.post("/api", async(req, res) => {
  const auth = req.get("Authorization");
  if(!auth || auth !== req.app.config.pastebin) return res.status(401).json({ message: "Unauthorized" });
  const { content } = req.body;
  if(!content || typeof content !== "string") return res.status(400).json({ message: "Content missing or not a string" });
  const id = Date.now().toString(36);
  const db = req.app.db;
  let expire = moment().add(604800000, 'ms').toDate()
  await new Schema({ id, content: content.trim(), time: new Date(), expire: expire}).save().catch(() => {});
  return res.json({ id, url: `${website}/pastebin/${id}` });
});
router.get('/management/pastebins/expire', async (req, res) => {
  const auth = req.get('Authorization');
  if(!auth || auth !== req.app.config.administrator) return res.status(401).render('error.ejs', {message: `Nope.. lmao.. hmm.. why are you still here?... this clearly ain't for you... so go do something else..`});
  await Schema.find().exec(async (err, db) => {
    if(db.length !== 0){
      let bins = 0;
      db.forEach(async data => {
      let moment = require('moment');
      require('moment-duration-format');
      let date = moment.duration(new Date(data.expire).getTime() - new Date().getTime()).format('s').toString().startsWith('-');
      if(date === true){
        bins = Math.floor(bins + 1)
        await Schema.findOneAndDelete({id: data.id})
      }
    })
    res.json({status: "Success", cleared: bins});
    }else{
      res.json({status: "None", cleared: 0})
    }
  });
})

module.exports = router;
