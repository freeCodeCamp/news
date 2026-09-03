import Joi from 'joi';

// Courses/subjects are stored as-is, so only the cache's own shape is validated
const cacheEntrySchema = Joi.object().keys({
  contentHash: Joi.string().required(),
  fetchedAt: Joi.string().isoDate().required(),
  slug: Joi.string().required(),
  title: Joi.string().required(),
  courses: Joi.array().items(Joi.object().unknown(true)).required(),
  subjects: Joi.array().items(Joi.object().unknown(true)).required()
});

const schema = Joi.object().keys({
  posts: Joi.object().pattern(Joi.string(), cacheEntrySchema).required()
});

export const classCentralSchemaValidator = cache => schema.validate(cache);
