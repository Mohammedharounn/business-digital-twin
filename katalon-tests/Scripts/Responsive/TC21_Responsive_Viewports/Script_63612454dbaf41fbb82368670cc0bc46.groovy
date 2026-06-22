import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

def sizes = [[1920,1080],[1366,768],[768,1024],[390,844]]
WebUI.openBrowser('')
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
for (def s : sizes) {
    WebUI.setViewPortSize(s[0], s[1])
    WebUI.delay(1)
    WebUI.takeScreenshot()
    WebUI.verifyElementPresent(findTestObject('Dashboard/h1_Title'), 8, com.kms.katalon.core.model.FailureHandling.OPTIONAL)
}
WebUI.closeBrowser()
