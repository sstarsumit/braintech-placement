import Company from '../models/Company.js';

export async function getMyCompany(req, res) {
  const company =
    (await Company.findOne({ owner: req.user._id })) ||
    (await Company.create({
      owner: req.user._id,
      companyName: req.user.name + ' (Company)',
      verificationStatus: 'pending'
    }));
  res.json(company);
}

export async function updateMyCompany(req, res) {
  const allowed = [
    'companyName', 'logo', 'industry', 'website', 'size', 'foundedYear', 'about',
    'hrName', 'hrPhone', 'country', 'state', 'city', 'address'
  ];
  const patch = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  });
  // company name change resets approval
  if (patch.companyName) {
    patch.verificationStatus = 'pending';
  }
  const company = await Company.findOneAndUpdate({ owner: req.user._id }, { $set: patch }, { new: true });
  res.json(company);
}
