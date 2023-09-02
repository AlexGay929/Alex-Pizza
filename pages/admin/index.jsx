import axios from "axios";
import Image from "next/image";
import { useState } from "react";
import styles from "../../styles/Admin.module.css";

const Index = ({ orders, products }) => {
  const [pizzaList, setPizzaList] = useState(products);
  const [orderList, setOrderList] = useState(orders);
  const status = ["preparing", "on the way", "delivered"];
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = async (id, field, newValue) => {
    try {
      const updatedProduct = { [field]: newValue };
      const res = await axios.put(`/api/products/${id}`, updatedProduct);
      // Update the pizzaList with the updated product data
      setPizzaList((prevList) =>
        prevList.map((product) =>
          product._id === id
            ? { ...product, [field]: res.data[field] }
            : product
        )
      );
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
    }
  };

  const handleDelete = async (id) => {
    console.log(id);

    try {
      const res = await axios.delete(
        `/api/products/${id}`
      );
      setPizzaList(pizzaList.filter((pizza) => pizza._id !== id));
    } catch (err) {
      console.log(err);
    }
  };
  
  const handleDeleteOrder = async (id) => {

    try {
      const res = await axios.delete(
        `/api/orders/${id}`
      );
      setOrderList(orderList.filter((order) => order._id !== id));
    } catch (err) {
      console.log(err);
    }
  }

  const handleStatus = async (id) => {
    const item = orderList.filter((order) => order._id === id)[0];
    const currentStatus = item.status;

    try {
      const res = await axios.put(`/api/orders/${id}`, {
        status: currentStatus + 1,
      });
      setOrderList([
        res.data,
        ...orderList.filter((order) => order._id !== id),
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.item}>
        <h1 className={styles.title}>Products</h1>
        <table className={styles.table}>
          <tbody>
            <tr className={styles.trTitle}>
              <th>Image</th>
              <th>Id</th>
              <th>Title</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </tbody>
          {pizzaList.map((product) => (
            <tbody key={product._id}>
              <tr className={styles.trTitle}>
                <td>
                  <Image
                    src={product.img}
                    width={50}
                    height={50}
                    objectFit="cover"
                    alt=""
                  />
                </td>
                <td>{product._id.slice(0, 5)}...</td>
                <td>
                    <input
                      type="text"
                      value={product.title}
                      onChange={(e) => {
                        if (isEditing) {
                          handleEdit(product._id, 'title', e.target.value);
                        }
                      }}
                      disabled={!isEditing}
                       />
                </td>
                <td>
                        <input
                          type="text" // Use type="text" to accept a comma-separated list
                          value={product.prices.join(',')} // Combine prices with a comma
                          onChange={(e) => {
                            if (isEditing) {
                              const newPrices = e.target.value.split(',').map(parseFloat); // Split and parse the input value
                              handleEdit(product._id, 'prices', newPrices);
                            }
                          }}
                          disabled={!isEditing}
                        />
                </td>
                <td>
                      <button
                    className={styles.button}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Save' : 'Edit'}
                  </button>
                  <button
                    className={styles.button}
                    onClick={() => handleDelete(product._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          ))}
        </table>
      </div>
      <div className={styles.item}>
        <h1 className={styles.title}>Orders</h1>
        <table className={styles.table}>
          <tbody>
            <tr className={styles.trTitle}>
              <th>Id</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </tbody>
          {orderList.map((order) => (
            <tbody key={order._id}>
              <tr className={styles.trTitle}>
                <td>{order._id.slice(0, 5)}...</td>
                <td>{order.customer}</td>
                <td>${order.total}</td>
                <td>
                  {order.method === 0 ? <span>cash</span> : <span>paid</span>}
                </td>
                <td>{status[order.status]}</td>
                <td>
                  <button onClick={() => handleStatus(order._id)}
                   className={styles.button}>
                    Next Stage
                  </button>
                  <button
                    className={styles.button}
                    onClick={() => handleDeleteOrder(order._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
};

export const getServerSideProps = async (ctx) => {
  const myCookie = ctx.req?.cookies || "";

  if (myCookie.token !== process.env.MY_TOKEN) {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }

  const productRes = await axios.get("https://alex-pizza-two.vercel.app/api/products");
  const orderRes = await axios.get("https://alex-pizza-two.vercel.app/api/orders");

  return {
    props: {
      orders: orderRes.data,
      products: productRes.data,
    },
  };
};

export default Index;