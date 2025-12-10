// Request validation middleware
const validateJob = (req, res, next) => {
  const { clientId, companyName, jobTitle, jobLink, status, notes, location } = req.body;
  const errors = [];

  // Only validate clientId if it's a POST request (not PUT)
  if (req.method === 'POST' && !clientId) {
    errors.push('clientId is required');
  }
  
  if (companyName !== undefined) {
    if (!companyName || companyName.trim().length === 0) {
      errors.push('companyName is required and cannot be empty');
    } else if (companyName.trim().length > 255) {
      errors.push('companyName must be 255 characters or less');
    }
  }
  
  if (jobTitle !== undefined) {
    if (!jobTitle || jobTitle.trim().length === 0) {
      errors.push('jobTitle is required and cannot be empty');
    } else if (jobTitle.trim().length > 255) {
      errors.push('jobTitle must be 255 characters or less');
    }
  }
  
  if (jobLink !== undefined) {
    if (!jobLink || jobLink.trim().length === 0) {
      errors.push('jobLink is required and cannot be empty');
    } else if (!isValidUrl(jobLink)) {
      errors.push('jobLink must be a valid URL');
    } else if (jobLink.length > 2048) {
      errors.push('jobLink must be 2048 characters or less');
    }
  }

  if (location !== undefined && location && location.trim().length > 255) {
    errors.push('location must be 255 characters or less');
  }

  if (notes !== undefined && notes && notes.length > 10000) {
    errors.push('notes must be 10000 characters or less');
  }

  if (status !== undefined) {
    if (!status || !['Applied', 'To be Applied', 'Not Fit', 'Duplicate'].includes(status)) {
      errors.push('status must be one of: Applied, To be Applied, Not Fit, Duplicate');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', errors });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', errors });
  }

  next();
};

// Helper functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  validateJob,
  validateLogin
};

