const generateHeader = (
  schoolLogo: string,
  schoolName: string,
  className: string,
  classYearGroup: string,
  academicYearEnd: number
) => `<header style="
            width: 100%; 
            height: 100px; 
            border-bottom: 2px solid #3a4a69;
            font-family: Verdana, sans-serif;
            display: flex; 
            align-items: center;
            padding: 0 20px;
            ">
            ${schoolLogo}   
            <div style="
              display: flex; 
              flex: 1; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              height: 100%;">
              <h1 style="font-size: 24px; color: #3a4a69; text-align: center; margin: 0;">End of Year Report</h1>
              <h2 style="font-size: 18px; color: #3a4a69; text-align: center; margin: 0;">${schoolName}</h2>
               <h3 style="font-family:verdana; font-size: 18px; color: #3a4a69; text-align: center; margin: 0;">${className} | ${classYearGroup} | ${academicYearEnd}</h3>
            </div>
            <div style="font-size: 14px; color: #3a4a69; text-align: center; margin: 0; padding-right: 20px; font-weight: bold" >
              <p><span class="pageNumber"></span> / <span class="totalPages"></p>
            </div>
        </header>`;

export default generateHeader;
