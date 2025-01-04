export const spaceWords = (str: string) => {
	const [spaced] = str.gsub("(%l)(%u)", "%1 %2");
	return spaced;
};
