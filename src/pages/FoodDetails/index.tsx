import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { Image, Alert } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import formatValue from '../../utils/formatValue';

import api from '../../services/api';

import {
  Container,
  Header,
  ScrollContainer,
  FoodsContainer,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
  AdditionalsContainer,
  Title,
  TotalContainer,
  AdittionalItem,
  AdittionalItemText,
  AdittionalQuantity,
  PriceButtonContainer,
  TotalPrice,
  QuantityContainer,
  FinishOrderButton,
  ButtonText,
  IconContainer,
} from './styles';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  formattedPrice: string;
  extras: Extra[];
}

const FoodDetails: React.FC = () => {
  const [food, setFood] = useState({} as Food);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [foodQuantity, setFoodQuantity] = useState(1);

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;

  async function loadFood(): Promise<void> {
    const { data } = await api.get(`/foods/${routeParams.id}`)
 
    setExtras(data.extras.map((e: Omit<Extra, 'quantity'>) => ({      
        ...e,
        quantity: 0      
    })))
    setFood({ ...data, formattedPrice: formatValue(data.price) })
  }

  useEffect(() => {
    loadFood();
  }, [routeParams]);

  function handleIncrementExtra(id: number): void {
    const parsedExtras = extras.map((e: Extra) => {
      return {
        ...e,
        quantity: id === e.id ? e.quantity + 1 : e.quantity
      }
    })

    setExtras(parsedExtras)
  }

  function handleDecrementExtra(id: number): void {
    const parsedExtras = extras.map((e: Extra) => {
      return {
        ...e,
        quantity: id === e.id || e.quantity === 0 ? e.quantity - 1 : e.quantity
      }
    })

    setExtras(parsedExtras)

  }

  function handleIncrementFood(): void {
    setFoodQuantity((state) =>  state + 1 )
  }
  
  function handleDecrementFood(): void {
    if(foodQuantity !== 1){
      setFoodQuantity((state) =>  state - 1 )    
    }
  }

  const toggleFavorite = useCallback(() => {
    if(isFavorite){
      api.delete(`/favorites/${food.id}`)
    } else {
      api.post(`/favorites`)
    }

    setIsFavorite(!isFavorite)
  }, [isFavorite, food]);

  const cartTotal = useMemo(() => {

    const extrasTotal = extras.reduce(( accumulator, extra ) => {
      return accumulator + extra.quantity * extra.value;
    }, 0)

    return formatValue((extrasTotal + food.price) * foodQuantity);

    // return total

  }, [extras, food, foodQuantity]);

  async function handleFinishOrder(): Promise<void> {
    // TODO - Finish order
    // const order = {
    //   ...food,
    //   extras      
    // }

    // delete order.formattedPrice

    // try {
    //   console.log(order)

    //   api.post(`orders`, order)

    //   navigation.navigate('Orders')      
    // } catch (error) {
    //   Alert.alert(`Erro`, `${JSON.stringify(error)}`)
    // }
  }

  // Calculate the correct icon name
  const favoriteIconName = useMemo(
    () => (isFavorite ? 'favorite' : 'favorite-border'),
    [isFavorite],
  );

  function getParsedPrice(){
    const parsedFood = { ...food, formattedPrice: food.price * foodQuantity }
    setFood(parsedFood)
  }

  useEffect(() => {
    getParsedPrice()
  }, [foodQuantity])

  useLayoutEffect(() => {
    // Add the favorite icon on the right of the header bar
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcon
          name={favoriteIconName}
          size={24}
          color="#FFB84D"
          onPress={() => toggleFavorite()}
        />
      ),
    });
  }, [navigation, favoriteIconName, toggleFavorite]);

  return (
    <Container>
      <Header />

      <ScrollContainer>
        <FoodsContainer>
          <Food>
            <FoodImageContainer>
              <Image
                style={{ width: 327, height: 183 }}
                source={{
                  uri: food.image_url,
                }}
              />
            </FoodImageContainer>
            <FoodContent>
              <FoodTitle>{food.name}</FoodTitle>
              <FoodDescription>{food.description}</FoodDescription>
              <FoodPricing>{food.formattedPrice}</FoodPricing>
            </FoodContent>
          </Food>
        </FoodsContainer>
        <AdditionalsContainer>
          <Title>Adicionais</Title>
          {extras.map(extra => (
            <AdittionalItem key={extra.id}>
              <AdittionalItemText>{extra.name}</AdittionalItemText>
              <AdittionalQuantity>
                  <Icon
                    size={15}
                    color={extra.quantity > 0 ?`#6C6C80` : `#fff9`}
                    name="minus"
                    onPress={() => handleDecrementExtra(extra.id)}
                    testID={`decrement-extra-${extra.id}`}
                  />
                <AdittionalItemText testID={`extra-quantity-${extra.id}`}>
                  {extra.quantity}
                </AdittionalItemText>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="plus"
                  onPress={() => handleIncrementExtra(extra.id)}
                  testID={`increment-extra-${extra.id}`}
                />
              </AdittionalQuantity>
            </AdittionalItem>
          ))}
        </AdditionalsContainer>
        <TotalContainer>
          <Title>Total do pedido</Title>
          <PriceButtonContainer>
            <TotalPrice testID="cart-total">{cartTotal}</TotalPrice>
            <QuantityContainer>
                          
              <Icon
                size={15}
                color={foodQuantity > 1 ?`#6C6C80` : `#fff9`}
                name="minus"
                onPress={handleDecrementFood}
                testID="decrement-food"
              />
            
              <AdittionalItemText testID="food-quantity">
                {foodQuantity}
              </AdittionalItemText>
              <Icon
                size={15}
                color="#6C6C80"
                name="plus"
                onPress={handleIncrementFood}
                testID="increment-food"
              />
            </QuantityContainer>
          </PriceButtonContainer>

          <FinishOrderButton onPress={() => handleFinishOrder()}>
            <ButtonText>Confirmar pedido</ButtonText>
            <IconContainer>
              <Icon name="check-square" size={24} color="#fff" />
            </IconContainer>
          </FinishOrderButton>
        </TotalContainer>
      </ScrollContainer>
    </Container>
  );
};

export default FoodDetails;
