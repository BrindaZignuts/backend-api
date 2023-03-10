/**
 * PlaceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

// Only admin can create a place

module.exports = {
  create: async (req, res) => {
    try {
      // Create new place in database
      const newPlace = await Place.create({
        name: req.body.name,
        unPTickets: 0,
        prefix: req.body.name[0] + req.body.name[1],
        owner: req.adminData.id,
      }).fetch();
      return res.status(200).json(newPlace);
    } catch (err) {
      return res.serverError(err);
    }
  },

  // Only registered user can find all the places from database

  find: async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skipIndex = (page - 1) * limit;
    try {
      const places = await Place.find({ limit: limit, skip: skipIndex });
      return res.status(200).json(places);
    } catch (err) {
      return res.serverError(err);
    }
  },

  // Only admin can find place by its id

  findOne: async (req, res) => {
    try {
      const place = await Place.findOne({ id: req.params.id });
      return res.status(200).json(place);
    } catch (err) {
      return res.serverError(err);
    }
  },

  // Only admin can update a place

  update: async (req, res) => {
    try {
      // Find place by param id
      const place = await Place.findOne({ id: req.params.id });
      // Check if current admin/owner is deleting this place
      if (req.adminData.id === place.owner) {
        try {
          // update the place
          const params = req.allParams();
          const updatedPlace = await Place.update({ id: place.id })
            .set({
              name: params.name,
              prefix: params.name[0] + params.name[1],
            })
            .fetch();
          // update all the tickets of this place
          await Ticket.update({ of: place.id }).set({ place: req.params.id });
          return res.status(200).json(updatedPlace);
        } catch (err) {
          return res.serverError(err);
        }
      } else {
        return res.status(401).json("Only admin/owner can update this place!");
      }
    } catch (err) {
      return res.serverError(err);
    }
  },

  // Only admin can delete a place

  delete: async (req, res) => {
    try {
      // Find place by param id
      const place = await Place.findOne({ id: req.params.id });
      if (!place) {
        return res.status(404).json("Place Doesn't exist!");
      }
      // Check if current admin/owner is deleting this place
      if (req.adminData.id === place.owner) {
        try {
          // delete the place
          await Place.destroy({ id: place.id });
          // delete all the tickets of this place
          await Ticket.destroy({ place: place.id });
          return res.send("Place has been deleted..");
        } catch (err) {
          return res.serverError(err);
        }
      } else {
        return res.status(401).json("Only admin/owner can delete this place!");
      }
    } catch (err) {
      return res.serverError(err);
    }
  },
};
