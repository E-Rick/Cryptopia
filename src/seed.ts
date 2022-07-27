import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const generateNonce = () => Math.floor(Math.random() * 1000000);

/** Seeds the databases */
const userData: Prisma.UserCreateInput[] = [
	{
		name: 'Erick',
		email: 'erick@wrecs.studio',
		username: 'wrecs',
		profileImageUrl:
			'https://gateway.pinata.cloud/ipfs/QmQxFznXuWMfEesBoK1j1Vm7rgesWvoKvGcX4Y3dDvVG4C',
		address: '0xf153337f18951B65642Cc88CcdF7f957CF993F9e',
		bio: 'event producer',
		nonce: generateNonce(), // initialize with a random nonce
	},
	{
		name: 'Nile',
		email: 'nile@wrecs.sudio',
		username: 'nile',
		profileImageUrl:
			'https://gateway.pinata.cloud/ipfs/QmQxFznXuWMfEesBoK1j1Vm7rgesWvoKvGcX4Y3dDvVG4C',
		address: '0x392e999325468bf113fdcB378581f6bdFE4C53F2',
		bio: 'community builder',
		nonce: generateNonce(), // initialize with a random nonce
	},
	{
		name: 'Nina',
		email: 'nina@wrecs.studio',
		username: 'nina',
		profileImageUrl:
			'https://gateway.pinata.cloud/ipfs/QmQxFznXuWMfEesBoK1j1Vm7rgesWvoKvGcX4Y3dDvVG4C',
		address: '0xa7Dd56B128dCD3A7210190cBD32BB70a248Ce13d',
		bio: 'artist',
		nonce: generateNonce(), // initialize with a random nonce
	},
];

async function main() {
	console.log(`Start seeding ...`);
	for (const u of userData) {
		const user = await prisma.user.create({
			data: u,
		});
		console.log(`Created user with id: ${user.id}`);
	}
	console.log(`Seeding finished.`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
