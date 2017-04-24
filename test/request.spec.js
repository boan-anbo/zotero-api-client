/* eslint-env mocha */
'use strict';

const URL = require('url');
const fetchMock = require('fetch-mock');
const { assert } = require('chai');
const request = require('../src/request');
const {
	ApiResponse,
	SingleReadResponse,
	MultiReadResponse
} = require('../src/response.js');
const singleGetResponseFixture = require('./fixtures/single-object-get-response.json');
const multiGetResponseFixture = require('./fixtures/multi-object-get-response.json');
const tagsResponseFixture = require('./fixtures/tags-data-response.json');
const searchesResponseFixture = require('./fixtures/searches-data-response.json');
const itemTypesDataFixture = require('./fixtures/item-types-data.json');

describe('ZoteroJS', () => {
	describe('request()', () => {
		beforeEach(() => {
			fetchMock.catch(request => {
				throw(new Error(`A request to ${request} was not expected`));
			});
		});

		afterEach(fetchMock.restore);

		it('should get a single item', () => {
			fetchMock.mock(
				'begin:https://api.zotero.org/users/475425/items/X42A7DEE',
				singleGetResponseFixture
			);

			return request({
				resource: {
					library: 'u475425',
					items: 'X42A7DEE'
				}
			}).then(response => {
				assert.instanceOf(response, SingleReadResponse);
				assert.equal(response.getData().key, 'X42A7DEE');
			});
		});

		it('should get /top items from a user library', () => {
			fetchMock.mock(
				'begin:https://api.zotero.org/users/475425/items/top',
				multiGetResponseFixture
			);

			return request({
				resource: {
					library: 'u475425',
					items: null,
					top: null
				}
			}).then(response => {
				assert.instanceOf(response, MultiReadResponse);
				assert.equal(response.getData().length, 15);
			});
		});

		it('should get /top items from a group library', () => {
			fetchMock.mock(
				'begin:https://api.zotero.org/groups/123456/items/top',
				multiGetResponseFixture
			);

			return request({
				resource: {
					library: 'g123456',
					items: null,
					top: null
				}
			}).then(response => {
				assert.instanceOf(response, MultiReadResponse);
				assert.equal(response.getData().length, 15);
			});
		});

		it('should get items from the trash', () => {
			fetchMock.mock(
				'begin:https://api.zotero.org/users/475425/items/trash',
				multiGetResponseFixture
			);

			return request({
				resource: {
					library: 'u475425',
					items: null,
					trash: null
				}
			}).then(response => {
				assert.instanceOf(response, MultiReadResponse);
				assert.equal(response.getData().length, 15);
			});
		});

		it('should get items from the collection', () => {
			fetchMock.mock(
				'begin:https://api.zotero.org/users/475425/collections/N7W92H48/items',
				multiGetResponseFixture
			);

			return request({
				resource: {
					library: 'u475425',
					collections: 'N7W92H48',
					items: null
				}
			}).then(response => {
				assert.instanceOf(response, MultiReadResponse);
				assert.equal(response.getData().length, 15);
			});
		});

		it('should get /top items from the collection', () => {
			fetchMock.mock(
				'begin:https://api.zotero.org/users/475425/collections/N7W92H48/items/top',
				multiGetResponseFixture
			);

			return request({
				resource: {
					library: 'u475425',
					collections: 'N7W92H48',
					items: null,
					top: null
				}
			}).then(response => {
				assert.instanceOf(response, MultiReadResponse);
				assert.equal(response.getData().length, 15);
			});
		});

		it('should get a set of all tags in the library', () => {
			fetchMock.mock(
				'begin:https://api.zotero.org/users/475425/tags',
				tagsResponseFixture
			);

			return request({
				resource: {
					library: 'u475425',
					tags: null
				}
			}).then(response => {
				assert.instanceOf(response, ApiResponse);
				assert.equal(response.getData().length, 25);
			});
		});

		it('should get a set of all tags in the library', () => {
			fetchMock.mock(
				'begin:https://api.zotero.org/users/475425/tags',
				tagsResponseFixture
			);

			return request({
				resource: {
					library: 'u475425',
					tags: null
				}
			}).then(response => {
				assert.instanceOf(response, ApiResponse);
				assert.equal(response.getData().length, 25);
			});
		});

		it('should get a single tag by name', () => {
			fetchMock.mock(
				/https:\/\/api\.zotero\.org\/users\/475425\/tags\?.*?tag=Fiction.*?/,
				tagsResponseFixture.slice(-1)
			);

			return request({
				resource: {
					library: 'u475425',
					tags: null
					},
				tag: 'Fiction'
			}).then(response => {
				assert.instanceOf(response, ApiResponse);
				assert.equal(response.getData().length, 1);
			});
		});

		it('should get searches', () => {
			fetchMock.mock(
				'begin:https://api.zotero.org/users/475425/searches',
				searchesResponseFixture
			);

			return request({
				resource: {
					library: 'u475425',
					searches: null
					}
			}).then(response => {
				assert.instanceOf(response, ApiResponse);
				assert.equal(response.getData().length, 1);
			});
		});

		it('should get a single search', () => {
			fetchMock.mock(
				'begin:https://api.zotero.org/users/475425/searches',
				searchesResponseFixture
			);

			return request({
				resource: {
					library: 'u475425',
					searches: null
					},
				searchKey: 'HHF7BB4C'
			}).then(response => {
				assert.instanceOf(response, ApiResponse);
				assert.equal(response.getData().length, 1);
			});
		});

		it('should handle sorting and pagination', () => {
			fetchMock.mock(
				url => {
					let parsedUrl = URL.parse(url);
					parsedUrl = parsedUrl.search.slice(1);
					parsedUrl = parsedUrl.split('&');
					if(!parsedUrl.includes('sort=title')) {
						return false;
					}
					if(!parsedUrl.includes('direction=asc')) {
						return false;
					}
					if(!parsedUrl.includes('limit=50')) {
						return false;
					}
					if(!parsedUrl.includes('start=25')) {
						return false;
					}
					return true;
				},
				multiGetResponseFixture
			);

			return request({
				resource: {
					library: 'u475425',
					items: null
					},
				sort: 'title',
				direction: 'asc',
				limit: 50,
				start: 25
			}).then(response => {
				assert.instanceOf(response, MultiReadResponse);
				assert.equal(response.getData().length, 15);
			});
		});

		it('should handle searching by itemKey', () => {
			fetchMock.mock(
				url => {
					let parsedUrl = URL.parse(url);
					parsedUrl = parsedUrl.search.slice(1);
					parsedUrl = parsedUrl.split('&');
					if(!parsedUrl.includes('itemKey=N7W92H48')) {
						return false;
					}
					return true;
				},
				[multiGetResponseFixture[0]]
			);

			return request({
				resource: {
					library: 'u475425',
					items: null
					},
				itemKey: 'N7W92H48'
			}).then(response => {
				assert.instanceOf(response, MultiReadResponse);
				assert.equal(response.getData().length, 1);
			});
		});

		it('should get a single search', () => {
			fetchMock.mock(
				'begin:https://api.zotero.org/users/475425/searches',
				searchesResponseFixture
			);

			return request({
				resource: {
					library: 'u475425',
					searches: null
					},
				searchKey: 'HHF7BB4C'
			}).then(response => {
				assert.instanceOf(response, MultiReadResponse);
				assert.equal(response.getData().length, 1);
			});
		});

		it('should get item types', () => {
			fetchMock.mock(
				'begin:https://api.zotero.org/users/475425/itemTypes',
				itemTypesDataFixture
			);

			return request({
				resource: {
					library: 'u475425',
					itemTypes: null
				}
			}).then(response => {
				assert.instanceOf(response, ApiResponse);
				assert.equal(response.getData().length, 2);
			});
		});

	});
});