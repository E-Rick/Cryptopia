import { PrismaClient } from '@prisma/client'; // import prisma client from @prisma/client node module

const prisma = new PrismaClient(); //instantiate PrismaClient

async function main() {
	// define an async `main` to send queries to the database.
	// create new link
	const newLink = await prisma.link.create({
		data: {
			description: 'the gawd',
			url: 'www.erickmartinezjr.com',
		},
	});
	const allLinks = await prisma.link.findMany(); // call findMany() to return all the `Link` records that exist in the db
	console.log(allLinks);
}

main() // call the main function
	.catch((e) => {
		throw e;
	})
	.finally(async () => {
		await prisma.$disconnect(); // close the database connections when the script ends.
	});
