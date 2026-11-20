// data/communities.js
// A directory of real philatelic organisations and online communities around the world.
// Every link below was opened and checked in November 2026. Websites change, so the page tells
// visitors the links are third-party. To add one, copy a block, give it a new unique `id`, and use
// a full https:// address. Allowed `type` and `region` values are listed right below.

export const COMMUNITY_TYPES = ['Federation', 'Society', 'Forum', 'Social', 'Official'];
export const COMMUNITY_REGIONS = ['International', 'India', 'United Kingdom', 'United States', 'Online'];
export const COMMUNITIES_CHECKED = 'November 2026';

export const communities = [
  {
    id: 'fip',
    name: 'Fédération Internationale de Philatélie (FIP)',
    region: 'International',
    type: 'Federation',
    description:
      'The world body of stamp collecting, founded in 1926. It has over 90 national member federations and recognises international stamp exhibitions.',
    url: 'https://www.f-i-p.ch/',
  },
  {
    id: 'aps',
    name: 'American Philatelic Society (APS)',
    region: 'United States',
    type: 'Society',
    description:
      'Founded in 1886. Its community pages help you find dealers, local clubs, specialty societies and a calendar of stamp shows and events.',
    url: 'https://stamps.org/Community',
  },
  {
    id: 'rpsl',
    name: 'Royal Philatelic Society London',
    region: 'United Kingdom',
    type: 'Society',
    description: 'One of the world’s oldest philatelic societies. Collectors from many countries can apply for membership online.',
    url: 'https://www.rpsl.org.uk/The-Society/Membership',
  },
  {
    id: 'abps',
    name: 'Association of British Philatelic Societies (ABPS)',
    region: 'United Kingdom',
    type: 'Federation',
    description: 'Brings together philatelic societies and regional federations across the UK. A good way to find a club near you in Britain.',
    url: 'https://www.abps.org.uk/',
  },
  {
    id: 'indian-philatelists-forum',
    name: 'Indian Philatelists’ Forum',
    region: 'India',
    type: 'Society',
    description:
      'A long-running website on Indian philately with stamp-issue listings, directories of societies and dealers, and news. Its old discussion group has closed, so use it for information and contacts.',
    url: 'https://indianphilately.net/',
  },
  {
    id: 'india-post-philately',
    name: 'India Post: Philately',
    region: 'India',
    type: 'Official',
    description: 'The official philately pages of India Post: history of philately in India, philatelic bureaux and the Philatelic Deposit Account.',
    url: 'https://app.indiapost.gov.in/philately/about',
  },
  {
    id: 'stamp-community',
    name: 'Stamp Community Forum',
    region: 'Online',
    type: 'Forum',
    description: 'A friendly forum of around 22,000 members covering U.S. and world stamps, covers, topicals and auctions. Free to join.',
    url: 'https://www.stampcommunity.org/',
  },
  {
    id: 'collectors-stamps-forum',
    name: 'Collectors Universe: Stamps Forum',
    region: 'Online',
    type: 'Forum',
    description: 'The stamps section of a large collectibles forum. Good for questions about grading, authenticity and the market.',
    url: 'https://forums.collectors.com/categories/stamps-forum',
  },
  {
    id: 'ebay-stamp-board',
    name: 'The Stamp Board (eBay Community)',
    region: 'Online',
    type: 'Forum',
    description: 'eBay’s community board for stamp buyers and sellers. Useful for tips on buying and selling stamps online.',
    url: 'https://community.ebay.com/forum/the-stamp-board-58035/',
  },
  {
    id: 'reddit-philately',
    name: 'r/philately on Reddit',
    region: 'Online',
    type: 'Social',
    description: 'An active community where collectors share finds, ask for identification help and talk about the hobby.',
    url: 'https://www.reddit.com/r/philately/',
  },
  {
    id: 'reddit-stampcollecting',
    name: 'r/stampcollecting on Reddit',
    region: 'Online',
    type: 'Social',
    description: 'A beginner-friendly Reddit community for showing collections and getting advice on starting out.',
    url: 'https://www.reddit.com/r/stampcollecting/',
  },
];
