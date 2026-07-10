const ContactConfig = require('../models/ContactConfig');

// @desc    Get contact configuration details
// @route   GET /api/contact
// @access  Public
const getContactConfig = async (req, res) => {
  try {
    let config = await ContactConfig.findOne();

    // If no configuration is in the DB, bootstrap with default Sunrise Fitness Hub info
    if (!config) {
      config = await ContactConfig.create({
        address: 'Kapilivaivari Street, infront of Seshadri Sadan, Annavarm, 533406',
        phone: '9299999288',
        email: 'contact@sunrisefitnesshub.com',
        whatsapp: '9299999288',
        googleMapsLink: 'https://maps.google.com',
        openingHours: 'Mon-Sat: 5:00 AM - 10:00 PM, Sun: 6:00 AM - 12:00 PM',
        socialMedia: {
          instagram: 'https://instagram.com/sunrise_fitness',
          facebook: 'https://facebook.com/sunrise_fitness',
          youtube: 'https://youtube.com/sunrise_fitness'
        }
      });
    }

    res.status(200).json({ success: true, config });
  } catch (error) {
    console.error('Get contact config error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving contact information' });
  }
};

// @desc    Update contact configuration
// @route   PUT /api/contact
// @access  Private/Admin
const updateContactConfig = async (req, res) => {
  try {
    const { address, phone, email, whatsapp, googleMapsLink, openingHours, socialMedia } = req.body;

    let config = await ContactConfig.findOne();
    if (!config) {
      config = new ContactConfig({});
    }

    config.address = address !== undefined ? address : config.address;
    config.phone = phone !== undefined ? phone : config.phone;
    config.email = email !== undefined ? email : config.email;
    config.whatsapp = whatsapp !== undefined ? whatsapp : config.whatsapp;
    config.googleMapsLink = googleMapsLink !== undefined ? googleMapsLink : config.googleMapsLink;
    config.openingHours = openingHours !== undefined ? openingHours : config.openingHours;

    // Handle file upload for QR Code
    if (req.file) {
      const { getFileUrl } = require('../middleware/uploadMiddleware');
      config.qrCode = getFileUrl(req.file, req);
    }

    // Support both flat fields (FormData) and nested JSON structure
    let instagram = req.body.instagram;
    let facebook = req.body.facebook;
    let youtube = req.body.youtube;

    if (socialMedia) {
      try {
        const parsedSocial = typeof socialMedia === 'string' ? JSON.parse(socialMedia) : socialMedia;
        instagram = parsedSocial.instagram !== undefined ? parsedSocial.instagram : instagram;
        facebook = parsedSocial.facebook !== undefined ? parsedSocial.facebook : facebook;
        youtube = parsedSocial.youtube !== undefined ? parsedSocial.youtube : youtube;
      } catch (err) {
        // Suppress parsing issues
      }
    }

    config.socialMedia = {
      instagram: instagram !== undefined ? instagram : config.socialMedia.instagram,
      facebook: facebook !== undefined ? facebook : config.socialMedia.facebook,
      youtube: youtube !== undefined ? youtube : config.socialMedia.youtube
    };

    await config.save();
    res.status(200).json({ success: true, message: 'Contact configurations updated successfully', config });
  } catch (error) {
    console.error('Update contact config error:', error);
    res.status(500).json({ success: false, message: 'Server error updating contact information' });
  }
};

// @desc    Submit a contact message and notify all administrators
// @route   POST /api/contact/message
// @access  Public
const submitContactMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Please fill out all required fields' });
    }

    const User = require('../models/User');
    
    // Find all users with the 'admin' role
    const admins = await User.find({ role: 'admin' });

    if (admins.length > 0) {
      for (let i = 0; i < admins.length; i++) {
        const admin = admins[i];
        admin.notifications.push({
          message: `New message from ${name} (${email}, Phone: ${phone || 'N/A'}): "${message}"`,
          read: false,
          date: new Date()
        });
        await admin.save();
      }
    }

    res.status(200).json({ success: true, message: 'Your message has been submitted and the administrators have been notified.' });
  } catch (error) {
    console.error('Submit contact message error:', error);
    res.status(500).json({ success: false, message: 'Server error processing contact query' });
  }
};

module.exports = {
  getContactConfig,
  updateContactConfig,
  submitContactMessage
};
