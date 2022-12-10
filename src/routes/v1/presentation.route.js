const express = require('express');
const { auth } = require('../../middlewares/auth');

const router = express.Router();

router.route('/').get(auth(), (req, res) => {
  res.send([
    {
      id: 'afsdahsbfa',
      name: 'Presentation',
      code: 'PRES',
      slices: [
        {
          type: 'text',
          heading: 'This is the first slice of the presentation',
          subHeading: 'This is the subheading of the first slice',
          content: 'This is the content of the first slice',
          options: [
            {
              id: '1',
              name: 'abc',
              count: 0,
            },
            {
              id: '2',
              name: 'def',
              count: 1,
            },
          ],
        },
      ],
    },
  ]);
});
module.exports = router;
