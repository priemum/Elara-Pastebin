module.exports = {
  website: `http://localhost:${process.env.PORT || 4000}`,
  session: {secret: process.env.SECRET},
  mongodb: process.env.MONGODB,
  pastebin: process.env.PASTEBIN,
  administrator: process.env.ADMIN
}