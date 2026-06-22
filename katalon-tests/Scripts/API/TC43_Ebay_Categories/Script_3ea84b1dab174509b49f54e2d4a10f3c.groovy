import internal.GlobalVariable as GlobalVariable
String token = CustomKeywords.'com.bdt.ApiKeywords.getAuthToken'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
['Electronics','Furniture','Business Equipment','Gaming Chair','Treadmill','Hair Dryer'].each { q ->
    def json = CustomKeywords.'com.bdt.ApiKeywords.searchEbay'(token, q)
    assert json.total >= 0
    println q + ' -> total=' + json.total + ', returned=' + json.items.size()
}
