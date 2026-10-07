const assert = require('node:assert/strict');
const test = require('node:test');
const {validationResult} = require('express-validator');
const {
  createTaskValidator,
  updateTaskValidator,
} = require('../dist/validators/taskValidators');

async function getValidationErrors(validators, body) {
  const request = {body, params: {}, query: {}};
  await Promise.all(validators.map(validator => validator.run(request)));
  return validationResult(request).array().map(error => error.msg);
}

test('task updates accept partial fields and clearing an optional deadline', async () => {
  assert.deepEqual(
    await getValidationErrors(updateTaskValidator, {
      category: 'Phone demo',
      deadline: null,
    }),
    [],
  );
});

test('task updates reject invalid deadlines and empty patches', async () => {
  assert.ok(
    (await getValidationErrors(updateTaskValidator, {deadline: 'not-a-date'})).includes(
      'Deadline must be a valid ISO date',
    ),
  );
  assert.ok(
    (await getValidationErrors(updateTaskValidator, {})).includes(
      'At least one field is required',
    ),
  );
});

test('task creation still requires a title', async () => {
  assert.ok((await getValidationErrors(createTaskValidator, {priority: 'High'})).includes(
    'Title is required',
  ));
});
