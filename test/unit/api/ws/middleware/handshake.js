/* eslint-disable mocha/no-nested-tests */
/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

'use strict';

const randomstring = require('randomstring');
const typeRepresentatives = require('../../../../fixtures/types_representatives.js');
const Handshake = require('../../../../../api/ws/workers/middlewares/handshake');
const failureCodes = require('../../../../../api/ws/rpc/failure_codes');
const WSServerMaster = require('../../../../common/ws/server_master');
const System = require('../../../../../modules/system');

const config = __testContext.config;

describe('Handshake', () => {
	let system;
	let handshake;
	const minVersion = '1.0.0';
	const validPeerNonce = randomstring.generate(16);
	const validNodeNonce = randomstring.generate(16);
	const validConfig = {
		config: {
			version: config.version,
			minVersion,
			nethash: config.nethash,
			nonce: validNodeNonce,
			blackListedPeers: [],
		},
	};
	let validHeaders;

	before(done => {
		new System((err, __system) => {
			system = __system;
			handshake = new Handshake.middleware.Handshake(
				system,
				validConfig.config
			);
			done(err);
		}, validConfig);
	});

	describe('compatibility', () => {
		beforeEach(done => {
			validHeaders = WSServerMaster.generatePeerHeaders({
				version: minVersion,
				nonce: validPeerNonce,
			});
			done();
		});

		it('should return an error when nonce is identical to server', done => {
			validHeaders.nonce = validConfig.config.nonce;
			handshake(validHeaders, err => {
				expect(err)
					.to.have.property('code')
					.equal(failureCodes.INCOMPATIBLE_NONCE);
				expect(err)
					.to.have.property('description')
					.equal(
						`Expected nonce to be not equal to: ${validConfig.config.nonce}`
					);
				done();
			});
		});

		it('should return an error when nethash does not match', done => {
			validHeaders.nethash = 'DIFFERENT_NETWORK_NETHASH';
			handshake(validHeaders, err => {
				expect(err)
					.to.have.property('code')
					.equal(failureCodes.INCOMPATIBLE_NETWORK);
				expect(err)
					.to.have.property('description')
					.contain(
						`Expected nethash: ${config.nethash} but received: ${
							validHeaders.nethash
						}`
					);
				done();
			});
		});

		it('should return an error when version is incompatible', done => {
			validHeaders.version = '0.0.0';
			handshake(validHeaders, err => {
				expect(err)
					.to.have.property('code')
					.equal(failureCodes.INCOMPATIBLE_VERSION);
				expect(err)
					.to.have.property('description')
					.equal(
						`Expected version: ${minVersion} but received: ${
							validHeaders.version
						}`
					);
				done();
			});
		});
	});

	after(done => {
		validHeaders = WSServerMaster.generatePeerHeaders({
			version: minVersion,
			nonce: '0123456789ABCDEF',
		});

		describe('schema tests', () => {
			let headers;

			beforeEach(beforeDone => {
				headers = _.cloneDeep(validHeaders);
				beforeDone();
			});

			describe('handshake', () => {
				const invalidTypes = _.difference(
					typeRepresentatives.allTypes,
					typeRepresentatives.objects
				);

				invalidTypes.forEach(type => {
					it(`should call callback with error.description when input is: ${
						type.description
					}`, eachDone => {
						handshake(type.input, err => {
							expect(err.description).to.equal(
								`Expected type object but found type ${type.expectation}`
							);
							eachDone();
						});
					});

					it(`should call callback with error.code when input is: ${
						type.description
					}`, itDone => {
						handshake(type.input, err => {
							expect(err.code).to.equal(failureCodes.INVALID_HEADERS);
							itDone();
						});
					});
				});

				describe('nonce', () => {
					const auxInvalidTypes = _.difference(
						typeRepresentatives.allTypes,
						typeRepresentatives.strings
					);

					const validValues = _.map(new Array(10), () => {
						return randomstring.generate(16);
					});

					auxInvalidTypes.forEach(type => {
						it(`should call callback with error.description when input is: ${
							type.description
						}`, itDone => {
							headers.nonce = type.input;
							handshake(headers, err => {
								expect(err.description).to.equal(
									`nonce: Expected type string but found type ${
										type.expectation
									}`
								);
								itDone();
							});
						});

						it(`should call callback with error.code when input is: ${
							type.description
						}
						`, itDone => {
							headers.nonce = type.input;
							handshake(headers, err => {
								expect(err.code).to.equal(failureCodes.INVALID_HEADERS);
								itDone();
							});
						});
					});

					validValues.forEach(input => {
						it(`should call callback with error = null when input is:${input}`, itDone => {
							handshake(headers, err => {
								expect(err).to.not.exist;
								itDone();
							});
						});
					});
				});

				describe('height', () => {
					const validValues = _.map(new Array(10), () => {
						return Math.floor(Math.random() * Number.MAX_VALUE);
					});

					const auxInvalidTypes = _.difference(
						typeRepresentatives.allTypes,
						typeRepresentatives.positiveIntegers,
						typeRepresentatives.negativeIntegers,
						typeRepresentatives.positiveNumbers,
						typeRepresentatives.negativeNumbers
					);

					auxInvalidTypes.forEach(type => {
						it(`should call callback with error.description when input is: ${
							type.description
						}
						`, itDone => {
							headers.height = type.input;
							handshake(headers, err => {
								expect(err.description).to.equal(
									`height: Expected type integer but found type ${
										type.expectation
									}`
								);
								itDone();
							});
						});

						it(`should call callback with error.code when input is: ${
							type.description
						}
						`, itDone => {
							headers.height = type.input;
							handshake(headers, err => {
								expect(err.code).to.equal(failureCodes.INVALID_HEADERS);
								itDone();
							});
						});
					});

					validValues.forEach(input => {
						it(`should call callback with error = null when input is: ${input}`, itDone => {
							headers.height = input;
							handshake(headers, err => {
								expect(err).to.not.exist;
								itDone();
							});
						});
					});
				});

				describe('nethash', () => {
					const auxInvalidTypes = _.difference(
						typeRepresentatives.allTypes,
						typeRepresentatives.strings
					);

					auxInvalidTypes.forEach(type => {
						it(`should call callback with error.description when input is: ${
							type.description
						}
						`, itDone => {
							headers.nethash = type.input;
							handshake(headers, err => {
								expect(err.description).to.equal(
									`nethash: Expected type string but found type ${
										type.expectation
									}`
								);
								itDone();
							});
						});

						it(`should call callback with error.code when input is: ${
							type.description
						}
						`, itDone => {
							headers.nethash = type.input;
							handshake(headers, err => {
								expect(err.code).to.equal(failureCodes.INVALID_HEADERS);
								itDone();
							});
						});
					});
				});

				describe('version', () => {
					const auxInvalidTypes = _.difference(
						typeRepresentatives.allTypes,
						typeRepresentatives.strings
					);

					auxInvalidTypes.forEach(type => {
						it(`should call callback with error.description when input is: ${
							type.description
						}
						`, itDone => {
							headers.version = type.input;
							handshake(headers, err => {
								expect(err.description).to.equal(
									`version: Expected type string but found type ${
										type.expectation
									}`
								);
								itDone();
							});
						});

						it(`should call callback with error.code when input is: ${
							type.description
						}
						`, itDone => {
							headers.version = type.input;
							handshake(headers, err => {
								expect(err.code).to.equal(failureCodes.INVALID_HEADERS);
								itDone();
							});
						});
					});
				});

				const requiredProperties = ['wsPort', 'version', 'nonce', 'nethash'];
				requiredProperties.forEach(property => {
					it(`should call callback with error for required property: ${property}`, itDone => {
						headers[property] = undefined;
						handshake(headers, err => {
							expect(err.description).to.equal(
								`Missing required property: ${property}`
							);
							itDone();
						});
					});
				});
			});
		});
		done();
	});
});
