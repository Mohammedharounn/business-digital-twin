import internal.GlobalVariable as GlobalVariable
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
