import { DiscogsReleaseResponse, DiscogsMasterResponse } from '../../src/types';

export const mockRelease: DiscogsReleaseResponse = {
  id: 249504,
  title: 'One More Time',
  artists: [{ name: 'Daft Punk', id: 1283 }],
  tracklist: [
    { position: 'A', title: 'One More Time (Short Radio Edit)', duration: '3:55' },
    { position: 'B', title: 'One More Time (Unplugged)', duration: '3:40' },
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
