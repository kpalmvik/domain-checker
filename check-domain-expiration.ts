if (process.argv.length === 2) {
  console.error("Expected at least one argument!");
  process.exit(1);
}

console.log(
  `This function will check the expiration date of the domain ${process.argv[2]}`
);
