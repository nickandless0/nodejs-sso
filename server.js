const express = require('express')
const app = express()
const QRCode = require('qrcode')
const bodyParser = require('body-parser')
const {GoogleAuth} = require('google-auth-library');
const speakeasy = require('speakeasy')
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('public'));

let db = [
  {
    name: 'test1',
    pass: '1234',
    secret: '',
  },
  {
    name: 'test2',
    pass: '1234',
    secret: '',
  },
  {
    name: 'test3',
    pass: '1234',
    secret: '',
  },
]

app.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  const user = db.find(user => user.name === username && user.pass === password)
  if (user) {
    const secret = speakeasy.generateSecret({
      name: '2FA'
    });
  
    const qrcodeBase64 = await QRCode.toDataURL(secret.otpauth_url);
  
    user.secret = secret.ascii

    res.json({
      qr: qrcodeBase64,
      secret: secret.ascii,
      type: 'success',
      message: 'Successfuly logedin.'
    });
    return;
  }

  res.json({
    type: 'error',
    message: 'Wrong credentials.'
  });
});

app.post('/me', async (req, res) => {
  const user = db.find(user => user.secret === req.body.token)
  return res.json({
    user,
  })
});

app.post('/confirm', async (req, res) => {
  const verified = speakeasy.totp.verify({
    secret: req.body.secret,
    encoding: 'ascii',
    token: req.body.code
  });

  res.json({
    verified: verified
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})