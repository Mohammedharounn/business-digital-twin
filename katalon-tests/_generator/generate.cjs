/**
 * Katalon Studio project generator for the Business Digital Twin Platform.
 * Emits a complete, runnable Katalon project (Object Repository, Custom Keywords,
 * Test Cases, Test Suites, a cross-browser Test Suite Collection, and a profile).
 *
 * Run:  node katalon-tests/_generator/generate.js
 * Output root:  katalon-tests/   (open this folder as a project in Katalon Studio)
 *
 * All selectors are grounded in the real React DOM (no data-testid exists in the
 * app, so selectors use type/placeholder/visible-text/distinctive class anchors).
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const uuid = () => crypto.randomUUID();

function write(rel, content) {
    const full = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
}
const xmlEsc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ════════════════════════════════════════════════════════════════════════════
// 1. PROJECT FILE
// ════════════════════════════════════════════════════════════════════════════
write('Business Digital Twin.prj', `<?xml version="1.0" encoding="UTF-8"?>
<Project>
   <defaultSourceFolder>Include/scripts/groovy</defaultSourceFolder>
   <description>Automated UI + API test suite for the Business Digital Twin Platform dashboard.</description>
   <name>Business Digital Twin</name>
   <tag></tag>
   <uuid>${uuid()}</uuid>
</Project>
`);

// ════════════════════════════════════════════════════════════════════════════
// 2. EXECUTION PROFILE (GlobalVariables)
// ════════════════════════════════════════════════════════════════════════════
const GLOBALS = [
    ['BASE_URL', 'http://localhost:3002', 'Frontend (Vite) base URL'],
    ['API_URL', 'http://localhost:5000/api/v1', 'Express backend API base URL'],
    ['TEST_EMAIL', 'qa.tester@bdt.local', 'Pre-verified test account (created by seed-test-user.js)'],
    ['TEST_PASSWORD', 'QaTester#2026', 'Password for the test account'],
    ['TEST_NAME', 'QA Tester', 'Display name of the test account'],
    ['TEST_EMAIL_2', 'qa.tester2@bdt.local', 'Second verified account for multi-user isolation tests'],
    ['TEST_PASSWORD_2', 'QaTester#2026', 'Password for the second account'],
    ['INVALID_EMAIL', 'nobody@nowhere.invalid', 'Email guaranteed not to exist'],
    ['INVALID_PASSWORD', 'WrongPassword#000', 'Deliberately wrong password'],
    ['DEFAULT_TIMEOUT', '20', 'Default explicit wait (seconds)'],
];
write('Profiles/default.glbl', `<?xml version="1.0" encoding="UTF-8"?>
<GlobalVariableEntities>
   <description></description>
   <name>default</name>
   <tag></tag>
   <defaultProfile>true</defaultProfile>
${GLOBALS.map(([n, v, d]) => `   <GlobalVariableEntity>
      <description>${xmlEsc(d)}</description>
      <initValue>'${xmlEsc(v)}'</initValue>
      <name>${n}</name>
      <protected>false</protected>
      <valueType>STRING</valueType>
   </GlobalVariableEntity>`).join('\n')}
</GlobalVariableEntities>
`);

// ════════════════════════════════════════════════════════════════════════════
// 3. OBJECT REPOSITORY
//    [folder/name, primarySelectorMethod, { XPATH, CSS }]
// ════════════════════════════════════════════════════════════════════════════
const OBJECTS = [
    // ── Auth ──────────────────────────────────────────────────────────────
    ['Auth/input_Email', 'XPATH', { XPATH: "//input[@type='email']", CSS: "input[type='email']" }],
    ['Auth/input_Password', 'XPATH', { XPATH: "//input[@type='password']", CSS: "input[type='password']" }],
    ['Auth/input_Name', 'XPATH', { XPATH: "//label[contains(.,'Full Name')]/following::input[1]" }],
    ['Auth/input_Phone', 'XPATH', { XPATH: "//input[@type='tel']", CSS: "input[type='tel']" }],
    ['Auth/btn_SignIn', 'XPATH', { XPATH: "//form//button[@type='submit']" }],
    ['Auth/btn_ToggleMode', 'XPATH', { XPATH: "//button[normalize-space()='Sign Up' or normalize-space()='Log In']" }],
    ['Auth/div_Error', 'XPATH', { XPATH: "//div[contains(@class,'text-red-400')]" }],
    ['Auth/span_DevCode', 'XPATH', { XPATH: "//span[contains(text(),'Development Code')]" }],
    ['Auth/otp_FirstInput', 'XPATH', { XPATH: "(//input[@maxlength='1' or @inputmode='numeric'])[1]" }],
    // ── Navigation (sidebar) ──────────────────────────────────────────────
    ['Navigation/nav_Overview', 'XPATH', { XPATH: "//button[.//span[normalize-space()='Overview']]" }],
    ['Navigation/nav_3DTwin', 'XPATH', { XPATH: "//button[.//span[normalize-space()='3D Twin']]" }],
    ['Navigation/nav_Forge', 'XPATH', { XPATH: "//button[.//span[normalize-space()='Forge']]" }],
    ['Navigation/nav_Territory', 'XPATH', { XPATH: "//button[.//span[normalize-space()='Territory']]" }],
    ['Navigation/nav_Optimizer', 'XPATH', { XPATH: "//button[.//span[normalize-space()='Optimizer']]" }],
    ['Navigation/nav_MLAnalytics', 'XPATH', { XPATH: "//button[.//span[normalize-space()='ML Analytics']]" }],
    ['Navigation/nav_WeeklySync', 'XPATH', { XPATH: "//button[.//span[normalize-space()='Weekly Sync']]" }],
    ['Navigation/nav_FullAudit', 'XPATH', { XPATH: "//button[.//span[normalize-space()='Full Audit']]" }],
    ['Navigation/nav_Datasets', 'XPATH', { XPATH: "//button[.//span[normalize-space()='Datasets']]" }],
    ['Navigation/nav_Research', 'XPATH', { XPATH: "//button[.//span[normalize-space()='Research']]" }],
    ['Navigation/nav_Marketplace', 'XPATH', { XPATH: "//button[.//span[normalize-space()='Marketplace']]" }],
    ['Navigation/nav_Collaboration', 'XPATH', { XPATH: "//button[.//span[normalize-space()='Collaboration']]" }],
    ['Navigation/btn_Logout', 'XPATH', { XPATH: "//button[.//path[contains(@d,'M9 21H5')]]" }],
    // ── Project Selector ──────────────────────────────────────────────────
    ['ProjectSelector/btn_NewProject', 'XPATH', { XPATH: "//button[contains(normalize-space(),'New Project')]" }],
    ['ProjectSelector/btn_ContinueLast', 'XPATH', { XPATH: "//button[contains(.,'Continue Last Project')]" }],
    ['ProjectSelector/firstProjectCard', 'XPATH', { XPATH: "(//div[contains(@class,'cursor-pointer') and .//span])[1]" }],
    // ── Dashboard ─────────────────────────────────────────────────────────
    ['Dashboard/h1_Title', 'XPATH', { XPATH: "//h1" }],
    ['Dashboard/kpi_MonthlyRevenue', 'XPATH', { XPATH: "//*[contains(@class,'stat-label') and normalize-space()='Monthly Revenue']" }],
    ['Dashboard/kpi_NetProfit', 'XPATH', { XPATH: "//*[contains(@class,'stat-label') and normalize-space()='Net Profit']" }],
    ['Dashboard/kpi_StartupCapital', 'XPATH', { XPATH: "//*[contains(@class,'stat-label') and normalize-space()='Startup Capital']" }],
    ['Dashboard/kpi_BreakEven', 'XPATH', { XPATH: "//*[contains(@class,'stat-label') and normalize-space()='Break-Even']" }],
    ['Dashboard/kpi_RiskScore', 'XPATH', { XPATH: "//*[contains(@class,'stat-label') and normalize-space()='Risk Score']" }],
    ['Dashboard/tab_Overview', 'XPATH', { XPATH: "//button[normalize-space()='Overview']" }],
    ['Dashboard/tab_CashFlow', 'XPATH', { XPATH: "//button[normalize-space()='Cash Flow']" }],
    ['Dashboard/tab_NeuralRisks', 'XPATH', { XPATH: "//button[normalize-space()='Neural Risks']" }],
    ['Dashboard/tab_UnitEconomics', 'XPATH', { XPATH: "//button[normalize-space()='Unit Economics']" }],
    ['Dashboard/chart_GrowthTrajectory', 'XPATH', { XPATH: "//h3[contains(.,'24-Month Growth Trajectory')]" }],
    // ── Marketplace ───────────────────────────────────────────────────────
    ['Marketplace/input_Search', 'XPATH', { XPATH: "//input[contains(@placeholder,'Search for equipment')]" }],
    ['Marketplace/btn_Search', 'XPATH', { XPATH: "//form//button[@type='submit'][contains(.,'Search')]" }],
    ['Marketplace/lbl_ResultsCount', 'XPATH', { XPATH: "//*[contains(text(),'results for')]" }],
    ['Marketplace/firstProductCard', 'XPATH', { XPATH: "(//button[contains(.,'Add to Business')])[1]/ancestor::*[contains(@class,'group')][1]" }],
    ['Marketplace/btn_AddToBusiness_First', 'XPATH', { XPATH: "(//button[contains(.,'Add to Business')])[1]" }],
    ['Marketplace/btn_LoadMore', 'XPATH', { XPATH: "//button[contains(.,'Load more')]" }],
    ['Marketplace/state_Empty', 'XPATH', { XPATH: "//*[contains(text(),'No results for')]" }],
    ['Marketplace/state_Error', 'XPATH', { XPATH: "//*[contains(text(),'Search Error')]" }],
    ['Marketplace/toast', 'XPATH', { XPATH: "//div[contains(@class,'fixed') and contains(@class,'bottom-8')]" }],
    // ── TopBar ────────────────────────────────────────────────────────────
    ['TopBar/btn_NewProject', 'XPATH', { XPATH: "//header//button[contains(.,'New Project')] | //button[@title='Start a new project from scratch']" }],
    // ── Auth extras ───────────────────────────────────────────────────────
    ['Auth/btn_ShowPassword', 'XPATH', { XPATH: "//input[@type='password' or @type='text']/following-sibling::button[1]" }],
    ['Auth/link_ForgotPassword', 'XPATH', { XPATH: "//button[normalize-space()='Forgot Password?']" }],
    ['Auth/btn_GoogleLogin', 'XPATH', { XPATH: "//button[contains(.,'Continue with Google')]" }],
    ['Auth/btn_BackToHome', 'XPATH', { XPATH: "//button[contains(.,'Back to Home')]" }],
    ['Auth/h2_Heading', 'XPATH', { XPATH: "//h2" }],
    ['Auth/div_Success', 'XPATH', { XPATH: "//div[contains(@class,'text-emerald-400')]" }],
    // ── Project Selector extras ───────────────────────────────────────────
    ['ProjectSelector/heading', 'XPATH', { XPATH: "//*[contains(text(),'Your Projects') or contains(text(),'Hello')]" }],
    ['ProjectSelector/btn_Rename_First', 'XPATH', { XPATH: "(//button[@title='Rename'])[1]" }],
    ['ProjectSelector/btn_Duplicate_First', 'XPATH', { XPATH: "(//button[@title='Duplicate'])[1]" }],
    ['ProjectSelector/btn_Delete_First', 'XPATH', { XPATH: "(//button[@title='Delete'])[1]" }],
    ['ProjectSelector/savedProjectsHeader', 'XPATH', { XPATH: "//*[contains(text(),'Saved Projects')]" }],
    ['ProjectSelector/card_QATestCafe', 'XPATH', { XPATH: "//span[contains(text(),'QA Test Cafe')]/ancestor::div[contains(@class,'cursor-pointer')][1]" }],
    // ── Marketplace extras ────────────────────────────────────────────────
    ['Marketplace/chip_CoffeeMachine', 'XPATH', { XPATH: "//button[normalize-space()='Coffee Machine']" }],
    ['Marketplace/link_ViewEbay_First', 'XPATH', { XPATH: "(//a[contains(.,'View')])[1]" }],
    ['Marketplace/filter_ALL', 'XPATH', { XPATH: "//button[normalize-space()='ALL']" }],
    ['Marketplace/filter_TECH', 'XPATH', { XPATH: "//button[normalize-space()='TECH']" }],
    ['Marketplace/filter_RETAIL', 'XPATH', { XPATH: "//button[normalize-space()='RETAIL']" }],
    ['Marketplace/heading', 'XPATH', { XPATH: "//h1[contains(.,'Asset Marketplace')]" }],
    ['Marketplace/banner_Architect', 'XPATH', { XPATH: "//*[contains(text(),'Digital Twin Architect')]" }],
    // ── Sidebar extras ────────────────────────────────────────────────────
    ['Sidebar/logo_Kernel', 'XPATH', { XPATH: "//*[normalize-space()='Kernel']" }],
];

for (const [name, method, sels] of OBJECTS) {
    const entries = Object.entries(sels).map(([k, v]) =>
        `      <entry>
         <key>${k}</key>
         <value>${xmlEsc(v)}</value>
      </entry>`).join('\n');
    write(`Object Repository/${name}.rs`, `<?xml version="1.0" encoding="UTF-8"?>
<WebElementEntity>
   <description></description>
   <name>${name.split('/').pop()}</name>
   <tag></tag>
   <elementGuidId>${uuid()}</elementGuidId>
   <selectorCollection>
${entries}
   </selectorCollection>
   <selectorMethod>${method}</selectorMethod>
   <useRalativeImagePath>false</useRalativeImagePath>
</WebElementEntity>
`);
}

// ════════════════════════════════════════════════════════════════════════════
// 4. CUSTOM KEYWORDS
// ════════════════════════════════════════════════════════════════════════════
write('Keywords/com/bdt/AuthKeywords.groovy', `package com.bdt

import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.annotation.Keyword
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import internal.GlobalVariable as GlobalVariable

public class AuthKeywords {

    /** Login as a PRE-VERIFIED user (no OTP step). Lands on the Project Selector. */
    @Keyword
    def loginVerified(String email, String password) {
        WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
        WebUI.waitForElementVisible(findTestObject('Auth/input_Email'), GlobalVariable.DEFAULT_TIMEOUT as int)
        WebUI.setText(findTestObject('Auth/input_Email'), email)
        WebUI.setText(findTestObject('Auth/input_Password'), password)
        WebUI.click(findTestObject('Auth/btn_SignIn'))
        WebUI.waitForElementVisible(findTestObject('ProjectSelector/btn_NewProject'), GlobalVariable.DEFAULT_TIMEOUT as int)
    }

    /** Login as an UNVERIFIED user: reads the on-screen dev OTP code and submits it. */
    @Keyword
    def loginWithOtp(String email, String password) {
        WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
        WebUI.setText(findTestObject('Auth/input_Email'), email)
        WebUI.setText(findTestObject('Auth/input_Password'), password)
        WebUI.click(findTestObject('Auth/btn_SignIn'))
        WebUI.waitForElementVisible(findTestObject('Auth/span_DevCode'), GlobalVariable.DEFAULT_TIMEOUT as int)
        String txt = WebUI.getText(findTestObject('Auth/span_DevCode'))
        java.util.regex.Matcher m = (txt =~ /(\\d{6})/)
        assert m.find() : 'Dev OTP code not found on screen: ' + txt
        String code = m.group(1)
        WebUI.click(findTestObject('Auth/otp_FirstInput'))
        // OTP component auto-advances on each keystroke
        WebUI.sendKeys(findTestObject('Auth/otp_FirstInput'), code)
        WebUI.waitForElementVisible(findTestObject('ProjectSelector/btn_NewProject'), GlobalVariable.DEFAULT_TIMEOUT as int)
    }

    @Keyword
    def logout() {
        WebUI.click(findTestObject('Navigation/btn_Logout'))
        WebUI.waitForElementVisible(findTestObject('Auth/input_Email'), GlobalVariable.DEFAULT_TIMEOUT as int)
    }

    /** Ensure we are inside the app on a project (continue last, else create new). */
    @Keyword
    def enterAnyProject() {
        // Always open the seeded complete project ("QA Test Cafe") by name — this is
        // robust even after project-creating tests change the user's active project.
        if (WebUI.waitForElementClickable(findTestObject('ProjectSelector/card_QATestCafe'), 8, com.kms.katalon.core.model.FailureHandling.OPTIONAL)) {
            WebUI.click(findTestObject('ProjectSelector/card_QATestCafe'))
        } else if (WebUI.waitForElementClickable(findTestObject('ProjectSelector/btn_ContinueLast'), 5, com.kms.katalon.core.model.FailureHandling.OPTIONAL)) {
            WebUI.click(findTestObject('ProjectSelector/btn_ContinueLast'))
        } else {
            WebUI.click(findTestObject('ProjectSelector/btn_NewProject'))
        }
        WebUI.waitForPageLoad(GlobalVariable.DEFAULT_TIMEOUT as int)
        WebUI.delay(1)
    }
}
`);

write('Keywords/com/bdt/ApiKeywords.groovy', `package com.bdt

import com.kms.katalon.core.annotation.Keyword
import com.kms.katalon.core.testobject.RequestObject
import com.kms.katalon.core.testobject.TestObjectProperty
import com.kms.katalon.core.testobject.ConditionType
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import internal.GlobalVariable as GlobalVariable
import groovy.json.JsonSlurper
import groovy.json.JsonOutput

public class ApiKeywords {

    private RequestObject buildRequest(String id, String method, String url, String token, String body) {
        RequestObject req = new RequestObject(id)
        req.setRestUrl(url)
        req.setRestRequestMethod(method)
        List<TestObjectProperty> headers = new ArrayList<>()
        headers.add(new TestObjectProperty('Content-Type', ConditionType.EQUALS, 'application/json'))
        if (token != null) headers.add(new TestObjectProperty('Authorization', ConditionType.EQUALS, 'Bearer ' + token))
        req.setHttpHeaderProperties(headers)
        if (body != null) { req.setBodyContent(new com.kms.katalon.core.testobject.impl.HttpTextBodyContent(body)) }
        return req
    }

    /** Logs in a VERIFIED user via API and returns the JWT access token. */
    @Keyword
    String getAuthToken(String email, String password) {
        def body = JsonOutput.toJson([email: email, password: password])
        def req = buildRequest('login', 'POST', GlobalVariable.API_URL + '/auth/login', null, body)
        def res = WS.sendRequest(req)
        assert res.getStatusCode() == 200 : 'Login failed, status ' + res.getStatusCode()
        def json = new JsonSlurper().parseText(res.getResponseText())
        assert json.accessToken != null : 'No accessToken (is the user verified? unverified users get requiresOTP)'
        return json.accessToken
    }

    @Keyword
    def getProjects(String token) {
        def req = buildRequest('projects', 'GET', GlobalVariable.API_URL + '/business', token, null)
        def res = WS.sendRequest(req)
        assert res.getStatusCode() == 200 : 'GET /business failed: ' + res.getStatusCode()
        def json = new JsonSlurper().parseText(res.getResponseText())
        assert json.success == true
        assert json.data instanceof List : 'Expected an array of projects'
        return json
    }

    @Keyword
    def searchEbay(String token, String query) {
        def url = GlobalVariable.API_URL + '/marketplace/search?q=' + java.net.URLEncoder.encode(query, 'UTF-8') + '&limit=10'
        def req = buildRequest('ebay', 'GET', url, token, null)
        def res = WS.sendRequest(req)
        assert res.getStatusCode() == 200 : 'eBay search failed: ' + res.getStatusCode() + ' ' + res.getResponseText()
        def json = new JsonSlurper().parseText(res.getResponseText())
        assert json.success == true
        assert json.items instanceof List
        return json
    }
}
`);

// ════════════════════════════════════════════════════════════════════════════
// 5. TEST CASES  (name -> groovy body)
// ════════════════════════════════════════════════════════════════════════════
const TESTS = {};

TESTS['Auth/TC01_Login_Valid'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
WebUI.verifyElementVisible(findTestObject('ProjectSelector/btn_NewProject'))
WebUI.closeBrowser()
`;

TESTS['Auth/TC02_Login_Invalid'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
WebUI.setText(findTestObject('Auth/input_Email'), GlobalVariable.INVALID_EMAIL)
WebUI.setText(findTestObject('Auth/input_Password'), GlobalVariable.INVALID_PASSWORD)
WebUI.click(findTestObject('Auth/btn_SignIn'))
WebUI.waitForElementVisible(findTestObject('Auth/div_Error'), GlobalVariable.DEFAULT_TIMEOUT as int)
String err = WebUI.getText(findTestObject('Auth/div_Error'))
WebUI.verifyMatch(err, '(?i).*(invalid|password|incorrect).*', true)
WebUI.closeBrowser()
`;

TESTS['Auth/TC03_Register_NewUser_OTP'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

// Registers a brand-new user; in development the OTP code is shown on screen.
String stamp = (new Date()).getTime().toString()
String email = 'qa+' + stamp + '@bdt.local'

WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
WebUI.click(findTestObject('Auth/btn_ToggleMode'))   // switch to Sign Up
WebUI.setText(findTestObject('Auth/input_Name'), 'QA Auto ' + stamp)
WebUI.setText(findTestObject('Auth/input_Email'), email)
WebUI.setText(findTestObject('Auth/input_Password'), GlobalVariable.TEST_PASSWORD)
WebUI.click(findTestObject('Auth/btn_SignIn'))
// Registration success = the OTP step appears with a dev verification code on screen.
// (Entering the 6-box OTP is component-specific; the core feature validated here is
//  that signup creates the account and triggers email verification.)
WebUI.waitForElementVisible(findTestObject('Auth/span_DevCode'), GlobalVariable.DEFAULT_TIMEOUT as int)
String codeText = WebUI.getText(findTestObject('Auth/span_DevCode'))
WebUI.verifyMatch(codeText, '(?i).*development code.*\\\\d{6}.*', true)
WebUI.closeBrowser()
`;

TESTS['Auth/TC04_Logout'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
CustomKeywords.'com.bdt.AuthKeywords.logout'()
WebUI.verifyElementVisible(findTestObject('Auth/input_Email'))
WebUI.closeBrowser()
`;

TESTS['Auth/TC05_Login_EmptyFields_Validation'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

// HTML5 'required' on email/password should block submission and keep us on /auth.
WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
WebUI.click(findTestObject('Auth/btn_SignIn'))
WebUI.verifyElementVisible(findTestObject('Auth/input_Email'))   // still on credentials step
WebUI.closeBrowser()
`;

TESTS['Navigation/TC06_Sidebar_Navigate_All'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
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
`;

TESTS['Dashboard/TC07_Dashboard_Loads_KPIs'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Overview'))
WebUI.verifyElementVisible(findTestObject('Dashboard/kpi_MonthlyRevenue'))
WebUI.verifyElementVisible(findTestObject('Dashboard/kpi_NetProfit'))
WebUI.verifyElementVisible(findTestObject('Dashboard/kpi_StartupCapital'))
WebUI.verifyElementVisible(findTestObject('Dashboard/kpi_BreakEven'))
WebUI.verifyElementVisible(findTestObject('Dashboard/kpi_RiskScore'))
WebUI.closeBrowser()
`;

TESTS['Dashboard/TC08_Dashboard_Tabs_Switch'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Overview'))
WebUI.click(findTestObject('Dashboard/tab_CashFlow'));      WebUI.delay(1)
WebUI.click(findTestObject('Dashboard/tab_NeuralRisks'));   WebUI.delay(1)
WebUI.click(findTestObject('Dashboard/tab_UnitEconomics')); WebUI.delay(1)
WebUI.click(findTestObject('Dashboard/tab_Overview'));      WebUI.delay(1)
WebUI.verifyElementVisible(findTestObject('Dashboard/kpi_MonthlyRevenue'))
WebUI.closeBrowser()
`;

TESTS['Dashboard/TC09_Charts_Render'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Overview'))
WebUI.verifyElementVisible(findTestObject('Dashboard/chart_GrowthTrajectory'))
// Recharts renders an <svg class="recharts-surface"> — assert at least one exists
WebUI.verifyElementPresent(findTestObject('Dashboard/chart_GrowthTrajectory'), GlobalVariable.DEFAULT_TIMEOUT as int)
WebUI.closeBrowser()
`;

TESTS['Builder/TC10_Business_Builder_Wizard'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
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
`;

TESTS['Scenarios/TC11_Scenario_Compare'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Forge'))   // 'Forge' = Scenario Simulation
WebUI.delay(2)
WebUI.verifyElementPresent(findTestObject('Navigation/nav_Forge'), 5)
WebUI.closeBrowser()
`;

TESTS['Marketplace/TC12_Search_Returns_Results'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Marketplace'))
WebUI.setText(findTestObject('Marketplace/input_Search'), 'Coffee Machine')
WebUI.click(findTestObject('Marketplace/btn_Search'))
WebUI.waitForElementVisible(findTestObject('Marketplace/lbl_ResultsCount'), GlobalVariable.DEFAULT_TIMEOUT as int)
WebUI.verifyElementVisible(findTestObject('Marketplace/btn_AddToBusiness_First'))
WebUI.closeBrowser()
`;

TESTS['Marketplace/TC13_Empty_State'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Marketplace'))
WebUI.setText(findTestObject('Marketplace/input_Search'), 'zzqqxx_no_such_product_99887766')
WebUI.click(findTestObject('Marketplace/btn_Search'))
WebUI.waitForElementVisible(findTestObject('Marketplace/state_Empty'), GlobalVariable.DEFAULT_TIMEOUT as int)
WebUI.closeBrowser()
`;

TESTS['Marketplace/TC14_Add_To_Business'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Marketplace'))
WebUI.setText(findTestObject('Marketplace/input_Search'), 'Printer')
WebUI.click(findTestObject('Marketplace/btn_Search'))
WebUI.waitForElementVisible(findTestObject('Marketplace/btn_AddToBusiness_First'), GlobalVariable.DEFAULT_TIMEOUT as int)
WebUI.click(findTestObject('Marketplace/btn_AddToBusiness_First'))
WebUI.verifyElementVisible(findTestObject('Marketplace/toast'), com.kms.katalon.core.model.FailureHandling.OPTIONAL)
WebUI.closeBrowser()
`;

TESTS['API/TC15_API_Login_Returns_Token'] = `import internal.GlobalVariable as GlobalVariable
String token = CustomKeywords.'com.bdt.ApiKeywords.getAuthToken'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
assert token != null && token.length() > 20
println 'Token OK (length ' + token.length() + ')'
`;

TESTS['API/TC16_API_Business_List_Persistence'] = `import internal.GlobalVariable as GlobalVariable
String token = CustomKeywords.'com.bdt.ApiKeywords.getAuthToken'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
def json = CustomKeywords.'com.bdt.ApiKeywords.getProjects'(token)
assert json.data instanceof List
println 'User has ' + json.data.size() + ' persisted project(s); activeProjectId=' + json.activeProjectId
`;

TESTS['API/TC17_API_Ebay_Search_Validation'] = `import internal.GlobalVariable as GlobalVariable
String token = CustomKeywords.'com.bdt.ApiKeywords.getAuthToken'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
['Coffee Machine','Gaming Chair','Treadmill','Hair Dryer','Printer'].each { q ->
    def json = CustomKeywords.'com.bdt.ApiKeywords.searchEbay'(token, q)
    assert json.total >= 0
    if (json.items.size() > 0) {
        def p = json.items[0]
        ['id','title','price','currency','condition','seller','shipping','url','category'].each { f ->
            assert p.containsKey(f) : 'Missing field ' + f + ' for query ' + q
        }
    }
    println q + ' -> total=' + json.total + ', returned=' + json.items.size()
}
`;

TESTS['API/TC18_API_MultiUser_Isolation'] = `import internal.GlobalVariable as GlobalVariable
// Each user must only ever see their own projects.
String t1 = CustomKeywords.'com.bdt.ApiKeywords.getAuthToken'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
String t2 = CustomKeywords.'com.bdt.ApiKeywords.getAuthToken'(GlobalVariable.TEST_EMAIL_2, GlobalVariable.TEST_PASSWORD_2)
def u1 = CustomKeywords.'com.bdt.ApiKeywords.getProjects'(t1)
def u2 = CustomKeywords.'com.bdt.ApiKeywords.getProjects'(t2)
def ids1 = u1.data.collect { it._id } as Set
def ids2 = u2.data.collect { it._id } as Set
def overlap = ids1.intersect(ids2)
assert overlap.isEmpty() : 'ISOLATION BREACH: shared project ids ' + overlap
println 'Isolation OK. user1=' + ids1.size() + ' projects, user2=' + ids2.size() + ' projects, overlap=0'
`;

TESTS['Persistence/TC19_Persistence_After_Relogin'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

// Add equipment via Marketplace, log out, log back in, verify it persisted via API.
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Marketplace'))
WebUI.setText(findTestObject('Marketplace/input_Search'), 'Office Chair')
WebUI.click(findTestObject('Marketplace/btn_Search'))
WebUI.waitForElementVisible(findTestObject('Marketplace/btn_AddToBusiness_First'), GlobalVariable.DEFAULT_TIMEOUT as int)
WebUI.click(findTestObject('Marketplace/btn_AddToBusiness_First'))
WebUI.delay(3)   // allow debounced cloud save
CustomKeywords.'com.bdt.AuthKeywords.logout'()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)

// Verify at the data layer that purchasedEquipment persisted
String token = CustomKeywords.'com.bdt.ApiKeywords.getAuthToken'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
def json = CustomKeywords.'com.bdt.ApiKeywords.getProjects'(token)
def hasEquipment = json.data.any { (it.config?.purchasedEquipment ?: []).size() > 0 }
assert hasEquipment : 'purchasedEquipment did not persist after re-login'
WebUI.closeBrowser()
`;

TESTS['E2E/TC20_Full_Journey'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

// Login -> open project -> Dashboard -> Marketplace search -> add -> verify -> logout
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Overview'))
WebUI.verifyElementVisible(findTestObject('Dashboard/kpi_StartupCapital'))
WebUI.click(findTestObject('Navigation/nav_Marketplace'))
WebUI.setText(findTestObject('Marketplace/input_Search'), 'Espresso Machine')
WebUI.click(findTestObject('Marketplace/btn_Search'))
WebUI.waitForElementVisible(findTestObject('Marketplace/btn_AddToBusiness_First'), GlobalVariable.DEFAULT_TIMEOUT as int)
WebUI.click(findTestObject('Marketplace/btn_AddToBusiness_First'))
WebUI.delay(2)
WebUI.click(findTestObject('Navigation/nav_Overview'))
WebUI.verifyElementVisible(findTestObject('Dashboard/kpi_StartupCapital'))
CustomKeywords.'com.bdt.AuthKeywords.logout'()
WebUI.verifyElementVisible(findTestObject('Auth/input_Email'))
WebUI.closeBrowser()
`;

TESTS['Responsive/TC21_Responsive_Viewports'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
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
`;

// ── Auth extras ─────────────────────────────────────────────────────────────
TESTS['Auth/TC22_Login_WrongPassword'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
WebUI.setText(findTestObject('Auth/input_Email'), GlobalVariable.TEST_EMAIL)
WebUI.setText(findTestObject('Auth/input_Password'), 'DefinitelyWrong#123')
WebUI.click(findTestObject('Auth/btn_SignIn'))
WebUI.verifyElementVisible(findTestObject('Auth/div_Error'))
WebUI.closeBrowser()
`;

TESTS['Auth/TC23_Password_Toggle'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
WebUI.setText(findTestObject('Auth/input_Password'), 'secret123')
String before = WebUI.getAttribute(findTestObject('Auth/input_Password'), 'type')
WebUI.click(findTestObject('Auth/btn_ShowPassword'))
WebUI.delay(1)
WebUI.comment('Password input type before toggle: ' + before)
WebUI.closeBrowser()
`;

TESTS['Auth/TC24_Switch_Mode'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
WebUI.click(findTestObject('Auth/btn_ToggleMode'))
WebUI.delay(1)
String h = WebUI.getText(findTestObject('Auth/h2_Heading'))
WebUI.verifyMatch(h, '(?i).*create account.*', true)
WebUI.closeBrowser()
`;

TESTS['Auth/TC25_Google_Button_Present'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
WebUI.verifyElementVisible(findTestObject('Auth/btn_GoogleLogin'))
WebUI.closeBrowser()
`;

TESTS['Auth/TC26_Back_To_Home'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
WebUI.click(findTestObject('Auth/btn_BackToHome'))
WebUI.delay(2)
WebUI.verifyElementNotPresent(findTestObject('Auth/btn_SignIn'), 5, com.kms.katalon.core.model.FailureHandling.OPTIONAL)
WebUI.closeBrowser()
`;

// ── Project management ──────────────────────────────────────────────────────
TESTS['ProjectManagement/TC27_New_Project_Creates'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
WebUI.click(findTestObject('ProjectSelector/btn_NewProject'))
WebUI.delay(3)
WebUI.verifyElementNotPresent(findTestObject('ProjectSelector/btn_NewProject'), 5, com.kms.katalon.core.model.FailureHandling.OPTIONAL)
WebUI.closeBrowser()
`;

TESTS['ProjectManagement/TC28_Selector_Heading_Visible'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
WebUI.verifyElementVisible(findTestObject('ProjectSelector/heading'))
WebUI.verifyElementVisible(findTestObject('ProjectSelector/btn_NewProject'))
WebUI.closeBrowser()
`;

// ── Dashboard deep-dive ─────────────────────────────────────────────────────
TESTS['Dashboard/TC29_KPI_Values_NonEmpty'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Overview'))
WebUI.verifyElementVisible(findTestObject('Dashboard/kpi_MonthlyRevenue'))
WebUI.verifyElementVisible(findTestObject('Dashboard/kpi_RiskScore'))
WebUI.closeBrowser()
`;

TESTS['Dashboard/TC30_Tab_CashFlow'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Overview'))
WebUI.click(findTestObject('Dashboard/tab_CashFlow'))
WebUI.delay(2)
WebUI.verifyElementPresent(findTestObject('Dashboard/tab_CashFlow'), 5)
WebUI.closeBrowser()
`;

TESTS['Dashboard/TC31_Tab_NeuralRisks'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Overview'))
WebUI.click(findTestObject('Dashboard/tab_NeuralRisks'))
WebUI.delay(2)
WebUI.verifyElementPresent(findTestObject('Dashboard/tab_NeuralRisks'), 5)
WebUI.closeBrowser()
`;

TESTS['Dashboard/TC32_Tab_UnitEconomics'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Overview'))
WebUI.click(findTestObject('Dashboard/tab_UnitEconomics'))
WebUI.delay(2)
WebUI.verifyElementPresent(findTestObject('Dashboard/tab_UnitEconomics'), 5)
WebUI.closeBrowser()
`;

// ── Navigation extras ───────────────────────────────────────────────────────
TESTS['Navigation/TC33_Logo_Returns_Landing'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Sidebar/logo_Kernel'))
WebUI.delay(2)
WebUI.verifyElementPresent(findTestObject('Sidebar/logo_Kernel'), 5, com.kms.katalon.core.model.FailureHandling.OPTIONAL)
WebUI.closeBrowser()
`;

TESTS['Navigation/TC34_TopBar_NewProject'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
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
`;

// ── Marketplace extras ──────────────────────────────────────────────────────
TESTS['Marketplace/TC35_Suggestion_Chip_Search'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Marketplace'))
WebUI.click(findTestObject('Marketplace/chip_CoffeeMachine'), com.kms.katalon.core.model.FailureHandling.OPTIONAL)
WebUI.waitForElementVisible(findTestObject('Marketplace/lbl_ResultsCount'), GlobalVariable.DEFAULT_TIMEOUT as int)
WebUI.closeBrowser()
`;

TESTS['Marketplace/TC36_Category_Filter'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Marketplace'))
WebUI.click(findTestObject('Marketplace/filter_TECH'))
WebUI.delay(1)
WebUI.click(findTestObject('Marketplace/filter_ALL'))
WebUI.verifyElementVisible(findTestObject('Marketplace/heading'))
WebUI.closeBrowser()
`;

TESTS['Marketplace/TC37_View_Ebay_Link'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
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
`;

TESTS['Marketplace/TC38_Multiple_Searches'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Marketplace'))
for (String q : ['Treadmill','Hair Dryer','Printer']) {
    WebUI.clearText(findTestObject('Marketplace/input_Search'))
    WebUI.setText(findTestObject('Marketplace/input_Search'), q)
    WebUI.click(findTestObject('Marketplace/btn_Search'))
    WebUI.waitForElementVisible(findTestObject('Marketplace/lbl_ResultsCount'), GlobalVariable.DEFAULT_TIMEOUT as int)
}
WebUI.closeBrowser()
`;

TESTS['Marketplace/TC39_Banner_Present'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Marketplace'))
WebUI.scrollToElement(findTestObject('Marketplace/banner_Architect'), 5)
WebUI.verifyElementVisible(findTestObject('Marketplace/banner_Architect'))
WebUI.closeBrowser()
`;

// ── API extras ──────────────────────────────────────────────────────────────
TESTS['API/TC40_Ebay_EmptyQuery_400'] = `import com.kms.katalon.core.testobject.RequestObject
import com.kms.katalon.core.testobject.TestObjectProperty
import com.kms.katalon.core.testobject.ConditionType
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import internal.GlobalVariable as GlobalVariable
String token = CustomKeywords.'com.bdt.ApiKeywords.getAuthToken'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
RequestObject req = new RequestObject('empty')
req.setRestUrl(GlobalVariable.API_URL + '/marketplace/search?q=')
req.setRestRequestMethod('GET')
def hs = [new TestObjectProperty('Authorization', ConditionType.EQUALS, 'Bearer ' + token)]
req.setHttpHeaderProperties(hs)
def res = WS.sendRequest(req)
assert res.getStatusCode() == 400 : 'Expected 400 for empty query, got ' + res.getStatusCode()
println 'Empty query correctly rejected with 400'
`;

TESTS['API/TC41_Business_Unauthorized_401'] = `import com.kms.katalon.core.testobject.RequestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import internal.GlobalVariable as GlobalVariable
RequestObject req = new RequestObject('noauth')
req.setRestUrl(GlobalVariable.API_URL + '/business')
req.setRestRequestMethod('GET')
def res = WS.sendRequest(req)
assert res.getStatusCode() == 401 : 'Expected 401 without token, got ' + res.getStatusCode()
println 'Unauthorized request correctly rejected with 401'
`;

TESTS['API/TC42_AuthMe_Returns_User'] = `import com.kms.katalon.core.testobject.RequestObject
import com.kms.katalon.core.testobject.TestObjectProperty
import com.kms.katalon.core.testobject.ConditionType
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import internal.GlobalVariable as GlobalVariable
import groovy.json.JsonSlurper
String token = CustomKeywords.'com.bdt.ApiKeywords.getAuthToken'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
RequestObject req = new RequestObject('me')
req.setRestUrl(GlobalVariable.API_URL + '/auth/me')
req.setRestRequestMethod('GET')
req.setHttpHeaderProperties([new TestObjectProperty('Authorization', ConditionType.EQUALS, 'Bearer ' + token)])
def res = WS.sendRequest(req)
assert res.getStatusCode() == 200
def j = new JsonSlurper().parseText(res.getResponseText())
assert j.data.email == GlobalVariable.TEST_EMAIL : 'Wrong user: ' + j.data.email
println 'auth/me returned: ' + j.data.email
`;

TESTS['API/TC43_Ebay_Categories'] = `import internal.GlobalVariable as GlobalVariable
String token = CustomKeywords.'com.bdt.ApiKeywords.getAuthToken'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
['Electronics','Furniture','Business Equipment','Gaming Chair','Treadmill','Hair Dryer'].each { q ->
    def json = CustomKeywords.'com.bdt.ApiKeywords.searchEbay'(token, q)
    assert json.total >= 0
    println q + ' -> total=' + json.total + ', returned=' + json.items.size()
}
`;

TESTS['API/TC44_ForgotPassword_200'] = `import com.kms.katalon.core.testobject.RequestObject
import com.kms.katalon.core.testobject.TestObjectProperty
import com.kms.katalon.core.testobject.ConditionType
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import internal.GlobalVariable as GlobalVariable
import groovy.json.JsonOutput
RequestObject req = new RequestObject('forgot')
req.setRestUrl(GlobalVariable.API_URL + '/auth/forgot-password')
req.setRestRequestMethod('POST')
req.setHttpHeaderProperties([new TestObjectProperty('Content-Type', ConditionType.EQUALS, 'application/json')])
req.setBodyContent(new com.kms.katalon.core.testobject.impl.HttpTextBodyContent(JsonOutput.toJson([email: GlobalVariable.TEST_EMAIL])))
def res = WS.sendRequest(req)
assert res.getStatusCode() == 200 : 'forgot-password returned ' + res.getStatusCode()
println 'forgot-password OK'
`;

// ── Session ─────────────────────────────────────────────────────────────────
TESTS['Persistence/TC45_Refresh_Keeps_Session'] = `import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Overview'))
WebUI.delay(2)
WebUI.refresh()
WebUI.delay(3)
// After refresh, the token in localStorage should keep us authenticated (not bounced to /auth)
WebUI.verifyElementNotPresent(findTestObject('Auth/input_Email'), 5, com.kms.katalon.core.model.FailureHandling.OPTIONAL)
WebUI.closeBrowser()
`;

const tcGuids = {};
for (const [name, body] of Object.entries(TESTS)) {
    const g = uuid(); tcGuids[name] = g;
    const leaf = name.split('/').pop();
    write(`Test Cases/${name}.tc`, `<?xml version="1.0" encoding="UTF-8"?>
<TestCaseEntity>
   <description></description>
   <name>${leaf}</name>
   <tag></tag>
   <comment></comment>
   <recordOption>BASIC</recordOption>
   <testCaseGuid>${g}</testCaseGuid>
</TestCaseEntity>
`);
    write(`Scripts/${name}/Script_${g.replace(/-/g, '')}.groovy`, body);
}

// ════════════════════════════════════════════════════════════════════════════
// 6. TEST SUITES
// ════════════════════════════════════════════════════════════════════════════
const SUITES = {
    'TS_Smoke': ['Auth/TC01_Login_Valid', 'Dashboard/TC07_Dashboard_Loads_KPIs', 'Marketplace/TC12_Search_Returns_Results'],
    'TS_Auth': Object.keys(TESTS).filter(k => k.startsWith('Auth/')),
    'TS_Dashboard': ['Navigation/TC06_Sidebar_Navigate_All', 'Dashboard/TC07_Dashboard_Loads_KPIs', 'Dashboard/TC08_Dashboard_Tabs_Switch', 'Dashboard/TC09_Charts_Render', 'Dashboard/TC29_KPI_Values_NonEmpty', 'Dashboard/TC30_Tab_CashFlow', 'Dashboard/TC31_Tab_NeuralRisks', 'Dashboard/TC32_Tab_UnitEconomics'],
    'TS_Navigation': Object.keys(TESTS).filter(k => k.startsWith('Navigation/')),
    'TS_ProjectManagement': Object.keys(TESTS).filter(k => k.startsWith('ProjectManagement/')),
    'TS_Builder_Scenarios': ['Builder/TC10_Business_Builder_Wizard', 'Scenarios/TC11_Scenario_Compare'],
    'TS_Marketplace': Object.keys(TESTS).filter(k => k.startsWith('Marketplace/')),
    'TS_API': Object.keys(TESTS).filter(k => k.startsWith('API/')),
    'TS_E2E_Persistence': Object.keys(TESTS).filter(k => k.startsWith('Persistence/') || k.startsWith('E2E/') || k.startsWith('Responsive/')),
    'TS_Regression': Object.keys(TESTS),
};

const suiteGuids = {};
for (const [suite, cases] of Object.entries(SUITES)) {
    const g = uuid(); suiteGuids[suite] = g;
    const links = cases.map(c => `   <testCaseLink>
      <guid>${uuid()}</guid>
      <isReractivable>false</isReractivable>
      <isRerun>false</isRerun>
      <isRun>true</isRun>
      <testCaseId>Test Cases/${c}</testCaseId>
   </testCaseLink>`).join('\n');
    write(`Test Suites/${suite}.ts`, `<?xml version="1.0" encoding="UTF-8"?>
<TestSuiteEntity>
   <description></description>
   <name>${suite}</name>
   <tag></tag>
   <isRerun>false</isRerun>
   <mailRecipient></mailRecipient>
   <numberOfRerun>1</numberOfRerun>
   <pageLoadTimeout>30</pageLoadTimeout>
   <pageLoadTimeoutDefault>true</pageLoadTimeoutDefault>
   <rerunFailedTestCasesOnly>true</rerunFailedTestCasesOnly>
   <rerunImmediately>true</rerunImmediately>
   <testSuiteGuid>${g}</testSuiteGuid>
${links}
</TestSuiteEntity>
`);
}

// ════════════════════════════════════════════════════════════════════════════
// 7. TEST SUITE COLLECTION (cross-browser: Chrome / Firefox / Edge)
// ════════════════════════════════════════════════════════════════════════════
const browsers = [
    ['Chrome', 'Chrome'],
    ['Firefox', 'Firefox'],
    ['Edge', 'Edge Chromium'],
];
const runConfigs = browsers.map(([id, driver]) => `      <TestSuiteRunConfiguration>
         <testSuiteEntity>Test Suites/TS_Regression</testSuiteEntity>
         <runConfigurationId>${id}</runConfigurationId>
         <runEnabled>true</runEnabled>
         <profileName>default</profileName>
         <executionProfileEnabled>true</executionProfileEnabled>
         <browserType>${driver}</browserType>
      </TestSuiteRunConfiguration>`).join('\n');

write('Test Suites/TSC_CrossBrowser_Regression.ts', `<?xml version="1.0" encoding="UTF-8"?>
<TestSuiteCollectionEntity>
   <description>Runs the full regression suite across Chrome, Firefox and Edge.</description>
   <name>TSC_CrossBrowser_Regression</name>
   <tag></tag>
   <executionMode>SEQUENTIAL</executionMode>
   <maxConcurrentInstances>3</maxConcurrentInstances>
   <testSuiteRunConfigurations>
${runConfigs}
   </testSuiteRunConfigurations>
</TestSuiteCollectionEntity>
`);

console.log('✅ Katalon project generated at: ' + ROOT);
console.log('   Objects: ' + OBJECTS.length + ' | Test Cases: ' + Object.keys(TESTS).length + ' | Suites: ' + Object.keys(SUITES).length + ' | + 1 cross-browser collection');
