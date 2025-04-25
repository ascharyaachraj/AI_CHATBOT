def get_sneaker_data(query):
    if "nike" in query.lower():
        return '''Here's a Nike Air Max 270 👟<br>
                  Price: ₹8,999<br>
                  <img class="shoe" src="https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/270.jpg" />'''
    elif "adidas" in query.lower():
        return '''Check out this Adidas Ultraboost! 👟<br>
                  Price: ₹9,499<br>
                  <img class="shoe" src="https://assets.adidas.com/images/w_600/f_auto,q_auto/ultraboost.jpg" />'''
    else:
        return "Sorry, I couldn't find anything. Try asking about Nike or Adidas shoes!" 