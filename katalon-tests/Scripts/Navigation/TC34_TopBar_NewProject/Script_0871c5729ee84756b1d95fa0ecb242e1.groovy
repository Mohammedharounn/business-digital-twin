import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('TopBar/btn_NewProject'))
WebUI.delay(2)
WebUI.verifyElementVisible(findTestObject('ProjectSelector/btn_NewProject'), com.kms.katalon.core.model.FailureHandling.OPTIONAL)
WebUI.closeBrowser()
