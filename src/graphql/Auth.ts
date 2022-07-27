import { extendType, interfaceType, nonNull, objectType, stringArg } from 'nexus';
import * as jwt from 'jsonwebtoken';

import { bufferToHex } from 'ethereumjs-util';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import { ethers } from 'ethers';
import { User } from './User';
import { APP_SECRET } from '../utils/auth';

export const AuthMutation = extendType({
	type: 'Mutation',
	definition(t) {
		// Login mutation
		t.nonNull.field('login', {
			type: 'LoginMutationResponse',
			args: {
				address: nonNull(stringArg()),
				signature: nonNull(stringArg()),
			},
			async resolve(_, args, ctx) {
				const { address, signature } = args;

				// Step 1: Get the user with the given publicAddress
				let user = await ctx.prisma.user.findUnique({ where: { address } });

				if (user) {
					// Step 2: Verify digital signature

					// We now are in possession of msg, publicAddress and signature. We
					// will use a helper from eth-sig-util to extract the address from the signature
					const msg = `Your unique login code ${user.nonce}`;
					const msgBufferHex: string = bufferToHex(Buffer.from(msg, 'utf8'));
					const addressRec = recoverPersonalSignature({
						data: msgBufferHex,
						signature,
					});

					// Verify the signing address from the signature
					const signingAddress = ethers.utils.verifyMessage(msg.toString(), signature);

					// The signature verification is successful if the address found with
					// sigUtil.recoverPersonalSignature matches the initial publicAddress
					if (signingAddress.toLowerCase() !== addressRec.toLowerCase()) {
						return {
							code: '401',
							success: false,
							message: `Signature verification failed for ${address}`,
							user: null,
						};
					}

					// Step 3: Generate a new nonce for the user
					const nonce = Math.floor(Math.random() * 10000);

					// Step 4: Create JWT
					const token = jwt.sign(
						{
							payload: {
								id: user.id,
								address: user.address as string | undefined,
							},
						},
						APP_SECRET,
						{
							algorithm: 'HS256',
							subject: user.address as string | undefined,
							expiresIn: '1d',
						}
					);

					// Update the user model with the JWT and new nonce
					const updatedUser = await ctx.prisma.user.update({
						where: { address: args.address },
						data: { token, nonce },
					});
					console.log('🚀 ~ file: Auth.ts ~ line 82 ~ resolve ~ user', user);

					return {
						code: '200',
						success: true,
						message: `Successfully logged in user for wallet address ${address}`,
						user: updatedUser,
					};
				}
				// Failed login
				return {
					code: '500',
					success: false,
					message: `Failed authentication for ${address}`,
					user: null,
				};
			},
		});

		t.nonNull.field('auth', {
			type: AuthMutationResponse,
			description: 'Check if the user with the current public Address exists in the database',
			args: {
				address: nonNull(stringArg()),
			},
			async resolve(_, args, ctx) {
				try {
					// Checks for existing user in the database and creates account if not found
					// const address = ctx && ctx.user ? ctx.user.address : args.address;

					// Search for existing user in the database
					let user = await ctx.prisma.user.findUnique({ where: { address: args.address } });

					// User not found, so create the new user account and generate the nonce
					if (!user) {
						user = await ctx.prisma.user.create({
							data: {
								address: args.address,
								nonce: Math.floor(Math.random() * 1000000), // initialize with a random nonce
							},
						});
						return {
							code: '201',
							success: true,
							message: `Successfully created new account for: ${args.address}`,
							nonce: user.nonce as number,
						};
					}

					// Return user's nonce (didn't create new acc)
					return {
						code: '200',
						success: true,
						message: `Successfully found user for address ${args.address}`,
						nonce: user.nonce as number,
					};
				} catch (error) {
					return {
						code: '404',
						success: false,
						message: `Error making finding or making user for ${args.address}`,
					};
				}
			},
		});
	},
});

export const MutationResponse = interfaceType({
	name: 'MutationResponse',
	resolveType(source) {
		return 'nonce' in source ? 'AuthMutationResponse' : 'LoginMutationResponse';
	},
	definition(t) {
		t.nonNull.string('code', {
			description: 'Similar to HTTP status, represents the status of the mutation',
		});
		t.nonNull.boolean('success', { description: 'Indicates whether the mutation was successful' });
		t.nonNull.string('message', { description: 'Human-readable message for the UI' });
	},
});

export const AuthMutationResponse = objectType({
	name: 'AuthMutationResponse',
	definition(t) {
		t.implements(MutationResponse);
		t.int('nonce');
	},
});

export const LoginMutationResponse = objectType({
	name: 'LoginMutationResponse',
	definition(t) {
		t.implements(MutationResponse);
		t.field('user', { type: User });
	},
});
