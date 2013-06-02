
module Db {

	export class Order {
		OrderId: number;
		Name: string;
		Paid: bool;
		Date: any;
		Items: OrderItem[];
	}

	export class OrderItem {
		OrderItemId: number;
		Description: string;
		Amount: number;
	}

}
