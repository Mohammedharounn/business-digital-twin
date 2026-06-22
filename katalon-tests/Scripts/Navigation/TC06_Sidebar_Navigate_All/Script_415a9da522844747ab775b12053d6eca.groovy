import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()

def navs = ['Navigation/nav_Overview','Navigation/nav_3DTwin','Navigation/nav_Forge',
            'Navigation/nav_Territory','Navigation/nav_Optimizer','Navigation/nav_MLAnalytics',
            'Navigation/nav_WeeklySync','Navigation/nav_FullAudit','Navigation/nav_Datasets',
            'Navigation/nav_Research','Navigation/nav_Marketplace','Navigation/nav_Collaboration']
for (String n : navs) {
    WebUI.click(findTestObject(n))
    WebUI.delay(1)
    WebUI.verifyElementPresent(findTestObject(n), 5)
}
WebUI.closeBrowser()
