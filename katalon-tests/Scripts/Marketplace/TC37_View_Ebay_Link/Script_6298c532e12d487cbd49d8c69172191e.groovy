import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Marketplace'))
WebUI.setText(findTestObject('Marketplace/input_Search'), 'Gaming Chair')
WebUI.click(findTestObject('Marketplace/btn_Search'))
WebUI.waitForElementVisible(findTestObject('Marketplace/link_ViewEbay_First'), GlobalVariable.DEFAULT_TIMEOUT as int)
String href = WebUI.getAttribute(findTestObject('Marketplace/link_ViewEbay_First'), 'href')
WebUI.verifyMatch(href, '(?i).*ebay.*', true)
WebUI.closeBrowser()
