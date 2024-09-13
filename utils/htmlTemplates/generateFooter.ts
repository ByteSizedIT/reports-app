const generateFooter = (
  schoolName: string,
  address1: string,
  address2: string,
  postcode: string,
  tel_num: string
) => `<footer style="font-size:12px; text-align:center; width:100%; font-family: Verdana, sans-serif; color: #3a4a69;">
        <p className="text-[1.33vw] p-[1.33vw] md:text-[1vw] md:p-[1vw]">${schoolName} | ${address1},  ${
  address2 ? address2 : ""
}, ${postcode} | ☎ ${tel_num}
        </p>
    </footer>`;

export default generateFooter;
