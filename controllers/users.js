const getUser = (req, res, next) => {
    console.log('fafdsf')
  console.log(req.body);
  
  return res.status(201)
};

exports.getUser = getUser;
