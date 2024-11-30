
document.addEventListener('DOMContentLoaded', function() {
    //const importTokenSubmitBtn = document.getElementById('import-token-dialog-submit');
    //importTokenSubmitBtn.addEventListener('click', importTokenDialogSubmit);

    const networkSelect = document.getElementById("networkSelect");
    networkSelect.addEventListener("change",changeNetwork);

    const importWalletSelect = document.getElementById("import-wallet");
    importWalletSelect.addEventListener("click",importWallet);

    const accountSelect = document.getElementById('accountSelect');
    accountSelect.addEventListener("change", accountChange);

    const securityTokenSelect = document.getElementById('security-token');
    securityTokenSelect.addEventListener("change", securityTokenChange);

    const buyTokenSelect = document.getElementById('buy-token');
    buyTokenSelect.addEventListener('click', buyToken);

    const sellSecuritySelect = document.getElementById('sell-security');
    sellSecuritySelect.addEventListener('click', sellSecurityToken);

    const importSecuritySelect = document.getElementById('import-security');
    importSecuritySelect.addEventListener('click', importSecurity );

    const buySecuritySelect = document.getElementById('buy-security');
    buySecuritySelect.addEventListener('click', buySecurity );

    const importTokenDialogCancelBtn = document.getElementById("import-token-dialog-cancel");
    importTokenDialogCancelBtn.addEventListener("click", importTokenDialogCancel );

    const importWalletDialogCancelBtn = document.getElementById("import-wallet-dialog-cancel");
    importWalletDialogCancelBtn.addEventListener("click", importWalletDialogCancel );

    const buyELMXTokenDialogSubmitBtn = document.getElementById("buy-elmxtoken-dialog-submit");
    buyELMXTokenDialogSubmitBtn.addEventListener("click", buyELMXTokenDialogSubmit );

    const buyELMXTokenDialogCancelBtn = document.getElementById("buy-elmxtoken-dialog-cancel");
    buyELMXTokenDialogCancelBtn.addEventListener("click", buyELMXTokenDialogCancel );

    const viewTokenSecurityBtn = document.getElementById("view-security");
    viewTokenSecurityBtn.addEventListener("click", viewTokenSecurity );

    const viewTokenDialogCancelBtn = document.getElementById("view-token-dialog-cancel");
    viewTokenDialogCancelBtn.addEventListener("click", viewTokenDialogCancel );

    const errorDialogCancelBtn = document.getElementById("error-dialog-cancel");
    errorDialogCancelBtn.addEventListener("click", errorDialogCancel );

    console.log("DOM loaded");
});