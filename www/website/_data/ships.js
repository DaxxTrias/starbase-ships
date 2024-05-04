const _ = require('lodash');

const shipTypes = [
  { id: 'miner', name: 'Miner', label: 'Miners' },
  { id: 'surface-miner', name: 'Surface Miner', label: 'Surface Miners' },
  { id: 'starter', name: 'Starter Ship', label: 'Starter Ships' },
  {
    id: 'asteroid-hauler',
    name: 'Asteroid Hauler',
    label: 'Asteroid Haulers',
  },
  { id: 'hauler', name: 'Hauler', label: 'Haulers' },
  { id: 'salvager', name: 'Salvager', label: 'Salvagers' },
  { id: 'fighter', name: 'Fighter', label: 'Fighters' },
  { id: 'command-ship', name: 'Command Ship', label: 'Command Ships' },
  { id: 'transport', name: 'Transport', label: 'Transports' },
  { id: 'explorer', name: 'Explorer', label: 'Explorers' },
];

module.exports = (data) => {
  const { ships } = data;

  _.each(ships, (ship) => {
    ship.similar = _(ships)
      .reject({ path: ship.path })
      .orderBy(
        (otherShip) => {
          const weight =
            (_.includes(ship.name, otherShip.name) ||
              _.includes(otherShip.name, ship.name)) * 10;
          return (
            weight +
            _.intersectionBy(ship.types, otherShip.types, 'type').length * 3 +
            _.intersectionWith(ship.tags, otherShip.tags, _.isEqual).length
          );
        },
        ['desc']
      )
      .slice(0, 4)
      .value();
  });

  return {
    list: ships,
    search: _.map(ships, (ship) =>
      _.pick(ship, [
        'name',
        'types',
        'saleType',
        'version',
        'slug',
        'tags',
        'webPath',
      ])
    ),
    types: { list: shipTypes, byId: _.keyBy(shipTypes, 'id') },
    tags: {
      list: _(ships)
        .map('tags')
        .flatten()
        .uniqBy('id')
        .orderBy('label')
        .value(),
    },
    downloads: {
      current: _(ships)
        .filter(({ blueprints }) => !_.isEmpty(blueprints))
        .map(({ blueprints, name, photos, shortDescription, slug }) => {
          const current = _.find(blueprints, { current: true });
          current.ship = { name, photos, shortDescription, slug };
          return current;
        })
        .value(),
    },
    bySaleType: _.groupBy(ships, 'saleType'),
    byType: _(shipTypes)
      .keyBy('id')
      .mapValues(({ id }) =>
        _(ships)
          .filter(({ types }) => _.find(types, { type: id }))
          .orderBy(({ types }) => _.find(types, { type: id }).order)
      )
      .value(),
  };
};
