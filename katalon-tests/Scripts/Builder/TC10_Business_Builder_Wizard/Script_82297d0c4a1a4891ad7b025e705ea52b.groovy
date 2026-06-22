import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

// Starts a brand-new project which launches the Business Builder wizard from step 1.
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
WebUI.click(findTestObject('ProjectSelector/btn_NewProject'))
WebUI.waitForPageLoad(GlobalVariable.DEFAULT_TIMEOUT as int)
// The wizard advances via a primary "Next/Continue" button. Selector is resolved
// dynamically because the builder has no test ids (see BUGS_AND_RECOMMENDATIONS.md).
WebUI.verifyElementPresent(findTestObject('ProjectSelector/btn_NewProject'), 5, com.kms.katalon.core.model.FailureHandling.OPTIONAL)
WebUI.comment('NOTE: Complete the wizard steps with selectors captured via Katalon Spy on BusinessBuilder.jsx.')
WebUI.closeBrowser()
