import { DiscogsReleaseResponse, DiscogsMasterResponse } from '../../src/types';

export const mockRelease: DiscogsReleaseResponse = {
  id: 249504,
  title: 'One More Time',
  artists: [{ name: 'Daft Punk', id: 1283 }],
  tracklist: [
    {
      position: '1',
      title: 'One More Time (Short Radio Edit)',
      duration: '3:55',
      type_: 'track',
    },
    {
      position: '2',
      title: 'One More Time (Unplugged)',
      duration: '3:40',
      type_: 'track',
    },
  ],
  master_id: 3369,
  year: 2000,
};

export const mockMaster: DiscogsMasterResponse = {
  id: 3369,
  year: 2000,
  title: 'One More Time',
  artists: [{ name: 'Daft Punk', id: 1283 }],
};
