
const sendEmail = (error, res = undefined) => {
  const body = {
    auth: process.env.alias,
    subject: 'One Network - render.com.',
    text: error,
  };
  fetch('https://my-emailer.onrender.com/send', {
    method: 'post',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  }).then((resp) => {
    if (res) {
      res.status(400).send();
    }
  });
}

export default sendEmail;
