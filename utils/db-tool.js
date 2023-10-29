// A helper function to assert the request ID param is valid
// and convert it to a number (since it comes as a string by default)
export const getIdParam = (req) => {
  const id = req.params.id
  if (/^\d+$/.test(id)) {
    return Number.parseInt(id, 10)
  }
  throw new TypeError(`Invalid ':id' param: "${id}"`)
}

// https://stackoverflow.com/questions/18304504/create-or-update-sequelize
// v6 has upsert: https://sequelize.org/docs/v6/other-topics/upgrade/#modelupsert
export const updateOrCreate = async (model, where, newItem) => {
  // First try to find the record
  const foundItem = await model.findOne({ where })
  if (!foundItem) {
    // Item not found, create a new one
    const item = await model.create(newItem)
    return { item, created: true }
  }
  // Found an item, update it
  const item = await model.update(newItem, { where })
  return { item, created: false }
}
